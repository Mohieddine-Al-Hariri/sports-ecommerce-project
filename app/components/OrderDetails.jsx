"use client";
import { useEffect, useState } from "react";
import OrderStateMenu from "./OrderStateMenu";
import OrderItem from "./OrderItem";
import { deleteOrder } from "@/lib";
import { useRouter } from "next/navigation";

const OrderDetails = ({ order, user }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [orderState, setOrderState] = useState(order.state);
  const router = useRouter();

  useEffect(() => {
    const isDarkModeLocal = JSON.parse(localStorage.getItem("isDarkMode"));
    if (isDarkModeLocal) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, []);

  let stateColor = "text-green-500";
  if (order.state === "Cancelled" || order.state === "Deleted")
    stateColor = "text-red-500";
  else if (order.state === "Delivering") stateColor = "text-[#4bc0d9]";
  else if (order.state === "Ordered") stateColor = "text-yellow-500";

  const handleDeleteOrder = async () => {
    await deleteOrder(order.id);
    router.refresh();
    router.push("/Admin/orders");
  };

  return (
    <div className="flex flex-col items-center justify-start gap-10 p-4 pb-16 pt-8 h-screen w-screen bgColor fontColor overflow-y-scroll overflow-x-hidden">
      <div className="w-full justify-between flex items-center">
        <h1 className="text-xl font-bold mb-2 border-b-2 border-gray-500">
          ${order.total}
        </h1>
        <div className="fontColor flex justify-center items-start relative ">
          {openMenu ? (
            <div>
              <OrderStateMenu
                handleDeleteOrder={handleDeleteOrder}
                isOpen={openMenu}
                setIsOpen={setOpenMenu}
                orderState={orderState}
                setOrderState={setOrderState}
                orderId={order.id}
              />
              <button
                onClick={() => setOpenMenu(true)}
                className="border-2 border-gray-500 rounded-full px-3 py-1 "
              >
                <h1 className={`${stateColor} font-bold`}>{orderState}</h1>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setOpenMenu(true)}
              className="border-2 border-gray-500 rounded-full px-3 py-1 "
            >
              <h1 className={`${stateColor} font-bold`}>{orderState}</h1>
            </button>
          )}
        </div>
      </div>
      <div>
        <h1>
          {order.theUser.firstName} {order.theUser.lastName}
        </h1>
        <h1>Location: {order.theUser.location}</h1>
        <h1>
          {order.theUser.phoneNumber
            ? "Phone Number: " + order.theUser.phoneNumber
            : "Email: " + order.theUser.email}
        </h1>
      </div>

      <div className="w-full sm:flex sm:flex-wrap gap-2 ">
        <h1 className="pl-4 mb-4 w-full">Items: {order.orderItems.length}</h1>
        {order.orderItems.map((item) => (
          <OrderItem key={item.id} item={item} />
        ))}
      </div>
      {/* Items */}
    </div>
  );
};

export default OrderDetails;
