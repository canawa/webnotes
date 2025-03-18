import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/lib/theme";

interface DonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DonationModal = ({ open, onOpenChange }: DonationModalProps) => {
  const { theme } = useTheme();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Support Our Project</DialogTitle>
        </DialogHeader>
        <div className="p-4">
          <Tabs defaultValue="tether">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="tether">USDT</TabsTrigger>
              <TabsTrigger value="bitcoin">BTC</TabsTrigger>
              <TabsTrigger value="ethereum">ETH</TabsTrigger>
              <TabsTrigger value="tron">TRX</TabsTrigger>
            </TabsList>
            <TabsContent
              value="tether"
              className="flex flex-col items-center mt-4"
            >
              <img
                src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80"
                alt="USDT QR Code"
                className="w-64 h-64 mb-2 bg-white p-2 rounded-md"
              />
              <div className="text-sm mt-2 text-center break-all p-2 bg-muted rounded-md">
                TRC20: TYmZ5EF2sTBEHxQGXsUviNJD1KYvYJT9GZ
              </div>
            </TabsContent>
            <TabsContent
              value="bitcoin"
              className="flex flex-col items-center mt-4"
            >
              <img
                src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80"
                alt="Bitcoin QR Code"
                className="w-64 h-64 mb-2 bg-white p-2 rounded-md"
              />
              <div className="text-sm mt-2 text-center break-all p-2 bg-muted rounded-md">
                BTC: bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh
              </div>
            </TabsContent>
            <TabsContent
              value="ethereum"
              className="flex flex-col items-center mt-4"
            >
              <img
                src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80"
                alt="Ethereum QR Code"
                className="w-64 h-64 mb-2 bg-white p-2 rounded-md"
              />
              <div className="text-sm mt-2 text-center break-all p-2 bg-muted rounded-md">
                ETH: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
              </div>
            </TabsContent>
            <TabsContent
              value="tron"
              className="flex flex-col items-center mt-4"
            >
              <img
                src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80"
                alt="Tron QR Code"
                className="w-64 h-64 mb-2 bg-white p-2 rounded-md"
              />
              <div className="text-sm mt-2 text-center break-all p-2 bg-muted rounded-md">
                TRX: TYmZ5EF2sTBEHxQGXsUviNJD1KYvYJT9GZ
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DonationModal;
