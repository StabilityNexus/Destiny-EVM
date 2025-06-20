"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "react-hot-toast";
import { useWalletStore } from "@/store/walletStore";
import {
  LoaderCircle,
  Check,
  Calendar as CalendarIcon,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { TimePickerDemo } from "../time/time-date-picker";
import { useWalletClient } from "wagmi";
// import { TimeField, TimeValue } from "@/components/ui/time-field";

export function CreateGameModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { address, isConnected } = useWalletStore();
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      pair: "ETH/USD",
      targetValue: "",
      dateTime: new Date(),
      creatorFee: "",
      agreeAndPay: false,
    },
  });

  const handleCreateGame = async (values: any) => {
    if (!isConnected) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!values.agreeAndPay) {
      toast.error("Please agree to the terms before creating the game");
      return;
    }

    try {
      setIsCreating(true);

      const selectedDateTime = values.dateTime; // Use combined date-time value

      const response = await fetch("/api/game/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pair: values.pair,
          targetValue: parseFloat(values.targetValue),
          deadline: selectedDateTime.getTime(),
          creator: address,
          creatorFee: parseFloat(values.creatorFee),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTxHash(data.txHash);
        setIsSuccess(true);
        toast.success("Game created successfully!");
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error("Error creating game:", error);
      toast.error("Failed to create game");
      setIsSuccess(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-lg">
        {!isCreating && !isSuccess ? (
          <>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Create your prediction game
              </DialogTitle>
              <p className="text-sm text-gray-600">
                Fill up inputs, pay the minimum initial value and good luck!
              </p>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleCreateGame)}
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pair"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          1. Pair
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 border-gray-300 bg-white focus:ring-2 focus:ring-lime-300 focus:border-lime-400">
                              <SelectValue placeholder="Select pair" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ETH/USD">ETH/USD</SelectItem>
                            <SelectItem value="BTC/USD">BTC/USD</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-gray-700">
                          2. Target Value
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            className="h-12 border-gray-300 focus:ring-2 focus:ring-lime-300 focus:border-lime-400"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="dateTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        3. Date & Time
                      </FormLabel>
                      <Popover>
                        <FormControl>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-[280px] justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP HH:mm:ss")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                        </FormControl>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                          <div className="p-3 border-t border-border">
                            <TimePickerDemo
                              setDate={field.onChange}
                              date={field.value}
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="creatorFee"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-gray-700">
                        5. Creator Fee (%)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-12 border-gray-300 focus:ring-2 focus:ring-lime-300 focus:border-lime-400"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="agreeAndPay"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="h-5 w-5 data-[state=checked]:bg-lime-500 data-[state=checked]:border-lime-500 rounded"
                        />
                      </FormControl>
                      <div className="leading-none">
                        <FormLabel className="text-base font-medium text-gray-700">
                          Agree and pay
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-14 text-lg bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold rounded-full transition-all duration-200 shadow-sm"
                  disabled={!form.getValues().agreeAndPay}
                >
                  Create Game
                </Button>
              </form>
            </Form>
          </>
        ) : isCreating ? (
          <div className="flex flex-col items-center justify-center py-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Creating...
            </h2>
            <LoaderCircle className="h-12 w-12 animate-spin text-lime-500" />
            <p className="text-sm text-gray-600 mt-4 text-center">
              Processing your transaction. This might take a moment.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">
              Game created
            </h2>
            <div className="rounded-full bg-lime-500 p-4 mb-4 shadow-md">
              <Check className="h-8 w-8 text-white" />
            </div>
            <p className="text-sm text-gray-600 mb-2 text-center">
              Should be available in some minutes. Have fun!
            </p>
            <p className="text-xs text-gray-500 mb-6 font-mono">
              Tx: {txHash.slice(0, 8)}...{txHash.slice(-4)}
            </p>
            <Button
              onClick={() => router.push("/profile")}
              className="bg-lime-400 hover:bg-lime-500 text-gray-900 font-semibold rounded-full px-6 py-2 transition-all duration-200 shadow-sm"
            >
              My Profile
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
