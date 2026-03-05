"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, Clock, Phone, ChefHat, CheckCircle2, XCircle } from "lucide-react";
import { type OrderStatus } from "@/db/schema";
import { cn } from "@/lib/utils";

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options?: string | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName?: string | null;
  customerPhone?: string | null;
  status: OrderStatus;
  totalAmount: number;
  pickupTime?: Date | null;
  notes?: string | null;
  createdAt: Date | null;
  items: OrderItem[];
}

interface OrderTicketProps {
  order: Order;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
  className?: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
  NEW: {
    label: "Nouveau",
    color: "text-blue-600",
    bgColor: "bg-blue-100 border-blue-200",
    icon: <Receipt className="w-3 h-3" />,
  },
  PREPARING: {
    label: "En préparation",
    color: "text-orange-600",
    bgColor: "bg-orange-100 border-orange-200",
    icon: <ChefHat className="w-3 h-3" />,
  },
  READY: {
    label: "Prêt",
    color: "text-emerald-600",
    bgColor: "bg-emerald-100 border-emerald-200",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  DELIVERED: {
    label: "Livré",
    color: "text-gray-600",
    bgColor: "bg-gray-100 border-gray-200",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  CANCELLED: {
    label: "Annulé",
    color: "text-red-600",
    bgColor: "bg-red-100 border-red-200",
    icon: <XCircle className="w-3 h-3" />,
  },
};

function formatPrice(cents: number): string {
  return (cents / 100).toFixed(2).replaceAll(".", ",") + "€";
}

function formatTime(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function OrderTicket({ order, onStatusChange, className }: Readonly<OrderTicketProps>) {
  const status = statusConfig[order.status];

  return (
    <div
      className={cn(
        "ticket-paper ticket-edge rounded-t-2xl rounded-b-none p-5 pb-8 relative transition-all hover:scale-[1.02]",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Receipt className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">{order.orderNumber}</h3>
            <p className="text-xs text-muted-foreground">
              {formatTime(order.createdAt)}
            </p>
          </div>
        </div>
        <Badge
          className={cn(
            "font-medium flex items-center gap-1.5 px-2.5 py-1",
            status.bgColor,
            status.color,
            "border"
          )}
        >
          {status.icon}
          {status.label}
        </Badge>
      </div>

      {(order.customerName || order.customerPhone) && (
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-dashed border-border">
          {order.customerName && (
            <span className="text-sm font-medium text-foreground">
              {order.customerName}
            </span>
          )}
          {order.customerPhone && (
            <span className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span className="font-medium">{order.customerPhone}</span>
            </span>
          )}
        </div>
      )}

      {order.pickupTime && (
        <div className="flex items-center gap-2 mb-4 p-2 rounded-lg bg-primary/5 border border-primary/10">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Retrait prévu : {formatTime(order.pickupTime)}
          </span>
        </div>
      )}

      <div className="space-y-3 mb-4">
        {order.items.map((item) => (
          <div key={item.id} className="group">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <span className="text-sm font-medium text-foreground">
                  {item.quantity}x {item.productName}
                </span>
              </div>
              <span className="text-sm text-muted-foreground ml-2">
                {formatPrice(item.totalPrice)}
              </span>
            </div>
            {item.options && (
              <div className="mt-1 pl-4 flex flex-wrap gap-1">
                {item.options.split(",").map((option, i) => (
                  <span
                    key={`option-${option.trim()}-${i}`}
                    className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground"
                  >
                    {option.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-700 font-medium">
            📝 {order.notes}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t border-dashed border-border">
        <span className="font-bold text-foreground">TOTAL</span>
        <span className="font-bold text-xl text-primary">
          {formatPrice(order.totalAmount)}
        </span>
      </div>

      {onStatusChange && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
        <div className="mt-4 flex gap-2">
          {order.status === "NEW" && (
            <Button
              size="sm"
              onClick={() => onStatusChange(order.id, "PREPARING")}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <ChefHat className="w-4 h-4 mr-1" />
              En préparation
            </Button>
          )}
          {order.status === "PREPARING" && (
            <Button
              size="sm"
              onClick={() => onStatusChange(order.id, "READY")}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Prêt !
            </Button>
          )}
          {order.status === "READY" && (
            <Button
              size="sm"
              onClick={() => onStatusChange(order.id, "DELIVERED")}
              className="flex-1"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Livré
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export function OrderTicketCompact({ order, onClick }: Readonly<{ order: Order; onClick?: () => void }>) {
  const status = statusConfig[order.status];

  return (
    <button
      onClick={onClick}
      className="w-full text-left ticket-paper rounded-xl p-4 transition-all hover:scale-[1.01] hover:shadow-lg"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-foreground">{order.orderNumber}</span>
        <Badge
          className={cn(
            "font-medium text-xs flex items-center gap-1",
            status.bgColor,
            status.color,
            "border"
          )}
        >
          {status.icon}
          {status.label}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground truncate mb-2">
        {order.items.map((item) => `${item.quantity}x ${item.productName}`).join(", ")}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">{formatTime(order.createdAt)}</span>
        <span className="font-semibold text-primary">{formatPrice(order.totalAmount)}</span>
      </div>
    </button>
  );
}
