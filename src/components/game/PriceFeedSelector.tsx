import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRICE_FEEDS } from "@/lib/contracts/feeds";
import { useChainId } from "wagmi";

export default function PriceFeedSelector({
  tokenPair,
  setTokenPair,
  feedAddress,
  setFeedAddress,
}: {
  tokenPair: string;
  setTokenPair: (pair: string) => void;
  feedAddress: string | undefined;
  setFeedAddress: (address: string) => void;
}) {
  const chainId = useChainId();

  // Get feeds for current chain
  const feedsForChain = PRICE_FEEDS[chainId] || {};

  // Handle selection
  const handlePairChange = (pair: string) => {
    setTokenPair(pair);
    const selectedAddress = feedsForChain[pair];
    if (selectedAddress) setFeedAddress(selectedAddress);
  };

  return (
    <div className="space-y-4">
      {/* Token Pair Dropdown */}
      <Select onValueChange={handlePairChange} value={tokenPair}>
        <SelectTrigger className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
          <SelectValue placeholder="Select a token pair" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(feedsForChain).map((pair) => (
            <SelectItem key={pair} value={pair}>
              {pair}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Feed Address (Auto-Filled) */}
      {/* <div>
        <input
          className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-700"
          value={feedAddress || ""}
          readOnly
        />
        {!feedAddress && (
          <p className="text-sm text-gray-500 mt-1">
            Select a token pair to view its feed address.
          </p>
        )}
      </div> */}
    </div>
  );
}
