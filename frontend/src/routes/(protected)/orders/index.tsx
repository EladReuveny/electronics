import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { HttpStatusCode } from "axios";
import {
  Calendar,
  CheckCircle,
  Eye,
  Hash,
  MapPin,
  Package,
  ShoppingBag,
  User as UserIcon,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "../../../components/LoadingSpinner";
import NoResultsFound from "../../../components/NoResultsFound";
import PageTitle from "../../../components/PageTitle";
import type { Order, Status } from "../../../features/orders/order.types";
import { ordersApi } from "../../../features/orders/orders.api";
import { ordersKeys } from "../../../features/orders/orders.keys";
import { productsKeys } from "../../../features/products/products.keys";
import { usersApi } from "../../../features/users/users.api";
import { usersKeys } from "../../../features/users/users.keys";
import { handleError } from "../../../lib/utils/utils";

const orderStatuses: {
  label: string;
  value: Status | "ALL";
  color: string;
  bgColor: string;
  Icon: React.ElementType;
}[] = [
  {
    label: "All",
    value: "ALL",
    color: "text-(--text-clr)",
    bgColor: "bg-(--text-clr)/10",
    Icon: ShoppingBag,
  },
  {
    label: "Pending",
    value: "PENDING",
    color: "text-amber-500",
    bgColor: "bg-amber-500/15",
    Icon: ShoppingBag,
  },
  {
    label: "Packaging",
    value: "PACKAGING",
    color: "text-blue-500",
    bgColor: "bg-blue-500/15",
    Icon: Package,
  },
  {
    label: "Delivered",
    value: "DELIVERED",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/15",
    Icon: CheckCircle,
  },
  {
    label: "Cancelled",
    value: "CANCELED",
    color: "text-red-500",
    bgColor: "bg-red-500/15",
    Icon: XCircle,
  },
];

const findMeQuery = queryOptions({
  queryKey: usersKeys.all,
  queryFn: () => usersApi.findMe(),
});

export const Route = createFileRoute("/(protected)/orders/")({
  component: OrdersPage,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(findMeQuery);
  },
});

function OrdersPage() {
  const viewAllOrdersDialog = useRef<HTMLDialogElement | null>(null);
  const viewOrderDetailsDialog = useRef<HTMLDialogElement | null>(null);
  const [activeOrderStatus, setActiveOrderStatus] = useState<Status | "ALL">(
    "ALL",
  );
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading: isUserLoading,
    error: userError,
  } = useSuspenseQuery(findMeQuery);

  const {
    data: orders,
    isLoading: isOrdersLoading,
    error: ordersError,
  } = useQuery({
    queryKey: ordersKeys.byUserId(user.id),
    queryFn: () => usersApi.findUserOrders(user.id),
    enabled: !!user.id,
  });

  const {
    data: ordersAsXML,
    isLoading: isOrdersAsXMLLoading,
    error: ordersAsXMLError,
  } = useQuery({
    queryKey: ordersKeys.asXML(),
    queryFn: () => ordersApi.findAllAsXML(),
    enabled: user.role === "ADMIN",
  });

  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKeys.all });
      queryClient.invalidateQueries({ queryKey: productsKeys.all });
    },
    onError: (err) => handleError(err),
  });

  const filteredOrders = useMemo(() => {
    if (activeOrderStatus === "ALL") return orders;
    return orders?.filter((order) => order.status === activeOrderStatus);
  }, [orders, activeOrderStatus]);

  const getStatusInfo = (status: Status) => {
    return orderStatuses.find((s) => s.value === status);
  };

  const handleCancelOrder = () => {
    if (!activeOrder) {
      toast.error("No active order selected");
      return;
    }

    if (!confirm("Are you sure you want to cancel this order?")) {
      return;
    }

    cancelOrderMutation.mutate(activeOrder?.id, {
      onSuccess: (data: { status: HttpStatusCode; message: string }) => {
        toast.success(data.message);
      },
    });
    viewOrderDetailsDialog.current?.close();
  };

  if (isUserLoading || isOrdersLoading || isOrdersAsXMLLoading) {
    return <LoadingSpinner />;
  }

  if (userError || ordersError || ordersAsXMLError) {
    handleError(userError || ordersError || ordersAsXMLError);
  }

  return (
    <div>
      <PageTitle title="My Orders" />

      {user.role === "ADMIN" && (
        <button
          type="button"
          className="ml-auto outline-none cursor-pointer flex items-center justify-center gap-2 bg-(--primary-clr) py-3 px-6 rounded-lg hover:brightness-110 active:scale-[97%]"
          onClick={() => viewAllOrdersDialog.current?.showModal()}
        >
          <Eye className="size-5" />
          View All (XML)
        </button>
      )}

      <div className="flex items-center flex-wrap gap-2.5 mt-2">
        {orderStatuses.map((status, i) => (
          <button
            type="button"
            key={`order-status-${i}`}
            onClick={() => setActiveOrderStatus(status.value)}
            className={`cursor-pointer flex items-center gap-2 py-2 px-4 rounded-lg border-2 ${
              activeOrderStatus === status.value
                ? `border-(--secondary-clr) bg-(--secondary-clr)/10 text-(--secondary-clr)`
                : `border-transparent bg-(--primary-clr)/10 text-(--text-clr-muted) hover:bg-(--primary-clr)/20`
            }`}
          >
            <status.Icon className="size-4.5" />
            {status.label}
          </button>
        ))}
      </div>

      <p className="text-(--text-clr-muted) mt-3">
        {filteredOrders?.length ?? 0}{" "}
        {filteredOrders?.length === 1 ? "order" : "orders"} found
      </p>

      <div className="space-y-4 mt-3">
        {(filteredOrders?.length ?? 0) > 0 ? (
          filteredOrders?.map((order, i) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo?.Icon;

            return (
              <div
                key={order.id}
                className="group flex items-center justify-between gap-4 p-5 border-2 border-(--primary-clr)/30 rounded-xl bg-(--primary-clr)/10 shadow-sm hover:bg-(--primary-clr)/20 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-lg ${statusInfo?.bgColor} ${statusInfo?.color}`}
                  >
                    {StatusIcon && <StatusIcon className="size-6" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-(--text-clr-muted)">
                        #{i + 1}
                      </span>
                      <h3 className="font-bold text-lg">Order #{order.id}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-sm text-(--text-clr-muted)">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="size-4" />
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>

                      <span className="size-1 bg-(--text-clr-muted) rounded-full" />

                      <span className="flex items-center gap-1.5">
                        <ShoppingBag className="size-4" />
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-5">
                  <div className="space-y-1">
                    <p className="text-sm text-(--text-clr-muted)">
                      Total Cost
                    </p>
                    <p className="text-2xl font-bold text-(--secondary-clr)">
                      ${order.totalCost.toFixed(2)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="outline-none cursor-pointer p-3 bg-(--primary-clr) rounded-lg hover:brightness-90 active:scale-[97%]"
                    onClick={() => {
                      setActiveOrder(order);
                      viewOrderDetailsDialog.current?.showModal();
                    }}
                    title="View order details"
                  >
                    <Eye className="size-6" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <NoResultsFound
            title="No orders found"
            description={
              activeOrderStatus === "ALL"
                ? "You haven't placed any orders yet."
                : `No orders with status "${activeOrderStatus.toLowerCase()}" were found.`
            }
            Icon={ShoppingBag}
          />
        )}
      </div>

      <dialog
        ref={viewAllOrdersDialog}
        className="bg-(--bg-clr) text-(--text-clr) fixed top-1/2 left-1/2 -translate-1/2 p-0 rounded-2xl w-3/4 backdrop:backdrop-blur-md shadow-2xl border-2 border-(--primary-clr)/30"
        onClick={(e) => {
          if (e.target === viewAllOrdersDialog.current)
            viewAllOrdersDialog.current?.close();
        }}
      >
        <div className="flex items-center justify-between p-6 border-b border-(--primary-clr)/30">
          <h2 className="font-bold text-2xl text-(--secondary-clr) flex items-center gap-3">
            <Eye className="size-7" />
            All Orders (XML)
          </h2>
          <button
            type="button"
            className="cursor-pointer bg-(--primary-clr)/10 hover:bg-(--primary-clr)/30 text-(--primary-clr) p-2 rounded-full"
            onClick={() => viewAllOrdersDialog.current?.close()}
          >
            <X className="size-6" />
          </button>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(85vh-100px)]">
          <pre className="bg-(--primary-clr)/10 border-2 border-(--primary-clr)/30 rounded-xl p-6 text-sm leading-relaxed overflow-x-auto">
            <>{ordersAsXML ?? ""}</>
          </pre>
        </div>
      </dialog>

      <dialog
        ref={viewOrderDetailsDialog}
        className="bg-(--bg-clr) text-(--text-clr) fixed top-1/2 left-1/2 -translate-1/2 rounded-2xl w-3/4 backdrop:backdrop-blur-md shadow-2xl border-2 border-(--primary-clr)/30"
        onClick={(e) => {
          if (e.target === viewOrderDetailsDialog.current)
            viewOrderDetailsDialog.current?.close();
        }}
      >
        {activeOrder && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-(--primary-clr)/30 bg-(--primary-clr)/5">
              <div className="flex items-center gap-4">
                <Hash
                  className={`size-10 p-2.5 rounded-lg ${getStatusInfo(activeOrder.status)?.bgColor} ${getStatusInfo(activeOrder.status)?.color}`}
                />

                <div>
                  <h3 className="text-2xl font-bold">Order Details</h3>
                  <p className="text-(--text-clr-muted) text-sm">
                    Order #{activeOrder.id}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="cursor-pointer bg-(--primary-clr)/10 hover:bg-(--primary-clr)/30 text-(--primary-clr) p-2 rounded-full"
                onClick={() => viewOrderDetailsDialog.current?.close()}
              >
                <X className="size-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-160px)] space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 p-4 bg-(--primary-clr)/10 rounded-xl">
                  <Package
                    className={`size-9 p-2 rounded-lg ${getStatusInfo(activeOrder.status)?.bgColor} ${getStatusInfo(activeOrder.status)?.color}`}
                  />

                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-(--text-clr-muted) uppercase tracking-wider font-bold">
                      Status
                    </span>
                    <span className="font-bold">{activeOrder.status}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-(--primary-clr)/10 rounded-xl">
                  <Calendar className="size-9 p-2 rounded-lg bg-indigo-500/15 text-indigo-500" />

                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-(--text-clr-muted) uppercase tracking-wider font-bold">
                      Placed On
                    </span>
                    <span className="font-bold">
                      {new Date(activeOrder.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-(--primary-clr)/10 rounded-xl">
                  <MapPin className="size-9 p-2 rounded-lg bg-orange-500/15 text-orange-500" />

                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-(--text-clr-muted) uppercase tracking-wider font-bold">
                      Shipping Address
                    </span>
                    <span className="font-bold truncate" title={user.address}>
                      {user.address}
                    </span>
                  </div>
                </div>

                {user.role !== "ADMIN" && (
                  <div className="flex items-center gap-4 p-4 bg-(--primary-clr)/10 rounded-xl">
                    <div className="p-2 rounded-lg bg-blue-500/15 text-blue-500">
                      <UserIcon className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs text-(--text-clr-muted) uppercase tracking-wider font-bold">
                        Customer
                      </p>
                      <p className="font-bold">@{user.email.split("@")[0]}</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between px-1">
                  <h4 className="font-bold text-xl flex items-center gap-2">
                    <ShoppingBag className="size-5" />
                    Order Items
                  </h4>
                  <span className="text-(--text-clr-muted)">
                    {activeOrder.items.length}{" "}
                    {activeOrder.items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                <div className="space-y-3 overflow-y-auto mt-4">
                  {activeOrder.items.map((item, i) => (
                    <Link
                      key={`order-${activeOrder.id}-item-${i}`}
                      to="/products/$productId"
                      params={{ productId: item.product.id }}
                      className="flex justify-between items-center p-3 border-2 border-(--primary-clr)/30 rounded-xl bg-(--primary-clr)/5 shadow-md hover:bg-(--primary-clr)/15"
                      title={`View details for ${item.product.name}`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-14 h-14 object-cover rounded-lg border border-(--primary-clr)/30"
                        />
                        <div className="space-y-1">
                          <h4 className="font-semibold text-(--secondary-clr)">
                            {item.product.name}
                          </h4>
                          <div className="flex items-center gap-3 text-sm text-(--text-clr-muted)">
                            <span>
                              Quantity:{" "}
                              <span className="font-bold text-(--text-clr)">
                                {item.quantity}
                              </span>
                            </span>

                            <span className="size-1 bg-(--text-clr-muted) rounded-full" />

                            <span className="font-bold text-(--text-clr)">
                              ${item.product.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <p className="font-semibold text-lg">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <hr className="mt-3 border-(--text-clr-muted)/30" />

            <div className="p-4 bg-(--primary-clr)/5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-xl font-bold">Total Cost:</span>
                <span className="text-3xl font-bold text-(--secondary-clr) bg-(--secondary-clr)/10 py-1.5 px-6 rounded-xl">
                  ${activeOrder.totalCost.toFixed(2)}
                </span>
              </div>

              {activeOrder.status === "PENDING" && (
                <button
                  type="button"
                  className="cursor-pointer flex items-center justify-center gap-2 bg-red-500/10 text-red-500 py-3 px-8 rounded-xl font-bold border-2 border-red-500/20 hover:bg-red-500 hover:text-(--text-clr) active:scale-[97%] disabled:opacity-50"
                  onClick={handleCancelOrder}
                  disabled={cancelOrderMutation.isPending}
                >
                  <XCircle className="size-5" />
                  {cancelOrderMutation.isPending
                    ? "Cancelling..."
                    : "Cancel Order"}
                </button>
              )}
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}
