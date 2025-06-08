"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateGameModal } from "./CreateGameModal";
import { useMetamaskStore } from "@/store/walletStore";
import toast from "react-hot-toast";

export function GameNavigation() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isConnected } = useMetamaskStore();

  const handleCreateClick = () => {
    if (!isConnected) {
      // toast({
      //   title: "Connect Wallet",
      //   description: "Please connect your wallet to create a game",
      //   variant: "destructive",
      // });
      toast.error("Please connect your wallet to create a game");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex py-3 justify-between items-center mx-4 gap-8 sm:gap-0">
        <Select>
          <SelectTrigger className="w-[180px] bg-[#F9F6E6]">
            <SelectValue placeholder="Filter by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">All games</SelectItem>
            <SelectItem value="bytimeup">Time Left ↓</SelectItem>
            <SelectItem value="bytimedown">Time Left ↑</SelectItem>
            <SelectItem value="byfeeup">Fee Level ↓</SelectItem>
            <SelectItem value="byfeedown">Fee Level ↑</SelectItem>
            <SelectItem value="byfinished">Finished</SelectItem>
          </SelectContent>
        </Select>

        <Button
          onClick={handleCreateClick}
          className="bg-[#BAD8B6] hover:bg-[#9DC88E] text-black"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Prediction
        </Button>
      </div>

      <CreateGameModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
