import { contractList, contractTypes } from "@/util/config";
import { CommunityFaucetV2, CommunityFaucetV2__factory } from "@/util/contract";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useWeb3 } from "./useWeb3";

type valueOf<T> = T[keyof T];

type option = Partial<{
  fetchOnly: boolean;
  fallback: boolean;
  cb?: (
    contract: CommunityFaucetV2,
    provider: ethers.providers.Provider
  ) => void | Promise<void>;
}>;

type useContract = <T extends keyof typeof contractList>(
  type: T,
  opt?: option
) => CommunityFaucetV2 | null;

const getContract = (
  type: valueOf<typeof contractList>,
  provider?: ethers.providers.Provider | ethers.Signer
) =>
  CommunityFaucetV2__factory.connect(
    type.address,
    provider || new ethers.providers.JsonRpcProvider(type.rpc)
  );

export const useContract: useContract = (
  type,
  { fetchOnly, fallback, cb } = {}
) => {
  const contractType = contractList[type];
  const { provider, chainId } = useWeb3();
  const [contract, setContract] = useState<null | CommunityFaucetV2>(
    fetchOnly ? getContract(contractType) : null
  );
  const isTargetChain = Number(contractType.chainId) === Number(chainId);

  useEffect(() => {
    if (fetchOnly) {
      setContract(getContract(contractType));
    } else if (fallback && !(provider && isTargetChain)) {
      setContract(getContract(contractType));
    } else if (provider && isTargetChain) {
      setContract(getContract(contractType, provider.getSigner()));
    } else {
      setContract(null);
    }
  }, [type, provider, chainId, fetchOnly, fallback]);

  useEffect(() => {
    if (contract) {
      cb &&
        void cb(
          contract,
          new ethers.providers.JsonRpcProvider(contractType.rpc)
        );
    }
  }, [contract]);

  return contract;
};

export const useJsonProvider = (type: contractTypes) =>
  new ethers.providers.JsonRpcBatchProvider(contractList[type].rpc);
