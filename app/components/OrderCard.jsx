"use client"
import Image from "next/image";
import { useState } from "react";
import OrderStateMenu from "./OrderStateMenu";
import Link from "next/link";

const OrderCard = ({ order, handleDeleteOrder }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [orderState, setOrderState] = useState(order.state);
  let stateColor = "text-green-500";
  if (order.state === "Cancelled" || order.state === "Deleted") stateColor = "text-red-500";
  else if(order.state === "Delivering") stateColor = "text-blue-500";
  else if(order.state === "Ordered") stateColor = "text-yellow-500";
  console.log("order", order);
  return (
    <div className="border border-gray-300 fontColor rounded-lg relative shadow-md w-64 m-4">
      <div className="h-32 overflow-hidden">
        <Link href={`/orderDetails/${order.id}`}>
          {order?.orderItems[0]?.product ? 
            <Image height={100} width={100} src={order.orderItems[0].product.imageUrls[0].url} alt={order.orderItems[0].product.name} className="w-full h-full object-cover" />
          :
          <div className="w-full h-full bg-black rounded-md"></div>
          }
        </Link>
      </div>
      <div className="p-4 fontColorGray gap-1 flex flex-col">
        <p className="text-base fontColorGray ">Total Price: ${order.total}</p>
        {/* <h2 className="text-xl font-bold mb-2">{order}</h2> */}
        {/* <p className="text-base text-gray-700 mb-4">Location: {order.theUser.location}</p> */}
          <p>{order.theUser.firstName}  {order.theUser.lastName}</p>
          <p>Location <br /> {order.theUser.location}</p>
          <p>{order.theUser.phoneNumber? "Phone Number " + order.theUser.phoneNumber : "Email " + order.theUser.email}</p>
        <div className="fontColor flex justify-center items-start relative ">
          {openMenu ? 
            <div>
              <OrderStateMenu handleDeleteOrder={handleDeleteOrder} isOpen={openMenu} setIsOpen={setOpenMenu} orderState={orderState} setOrderState={setOrderState} orderId={order.id}/>
              <button onClick={() => setOpenMenu(true)} className="border-2 border-gray-500 rounded-full px-3 py-1 ">
                <h1 className={`${stateColor} font-bold`}>{orderState}</h1> 
              </button>
            </div>
            :
            <button onClick={() => setOpenMenu(true)} className="border-2 border-gray-500 rounded-full px-3 py-1 ">
              <h1 className={`${stateColor} font-bold`}>{orderState}</h1>
            </button>
          }
        </div>
      </div>
    </div>
  );
}

export default OrderCard