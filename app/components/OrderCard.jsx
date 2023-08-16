"use client"
import { publishSubmittedOrder, updateOrderState } from "@/lib";
import Image from "next/image";
import { useState } from "react";
import OrderStateMenu from "./OrderStateMenu";
import Link from "next/link";

const OrderCard = ({ order }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [orderState, setOrderState] = useState(order.state);
  let stateColor = "text-green-500";
  if (order.state === "Cancelled" || order.state === "Deleted") stateColor = "text-red-500";
  else if(order.state === "Delivering") stateColor = "text-blue-500";
  else if(order.state === "Ordered") stateColor = "text-yellow-500";
  
  return (
    <div className="border border-gray-300 rounded-lg relative shadow-md w-64 m-4">
      <div className="h-32 overflow-hidden">
        <Link href={`orderDetails/${order.id}`}>
          <Image height={100} width={100} src={order.orderItems[0].product.images[0].url} alt={order.orderItems[0].product.name} className="w-full h-full object-cover" />
        </Link>
      </div>
      <div className="p-4 text-gray-700 gap-1 flex flex-col">
        <p className="text-base text-gray-700 ">Total Price: ${order.total}</p>
        {/* <h2 className="text-xl font-bold mb-2">{order}</h2> */}
        {/* <p className="text-base text-gray-700 mb-4">Location: {order.theUser.location}</p> */}
          <p>{order.theUser.firstName}  {order.theUser.lastName}</p>
          <p>Location <br /> {order.theUser.location}</p>
          <p>{order.theUser.phoneNumber? "Phone Number " + order.theUser.phoneNumber : "Email " + order.theUser.email}</p>
        <div className="fontColor flex justify-center items-start relative ">
          {openMenu ? 
            <div>

              <OrderStateMenu isOpen={openMenu} setIsOpen={setOpenMenu} orderState={orderState} setOrderState={setOrderState} orderId={order.id}/>
              <button onClick={() => setOpenMenu(true)} className="border-2 border-gray-500 rounded-full px-3 py-1 ">
                <h1 className={`${stateColor} font-bold`}>{orderState}{/*TODO: make it {order.state} instead? */}</h1> 
              </button>
            </div>
            :
            <button onClick={() => setOpenMenu(true)} className="border-2 border-gray-500 rounded-full px-3 py-1 ">
              <h1 className={`${stateColor} font-bold`}>{orderState}</h1>
            </button>
          }
          
          {/* <svg
            width="30px"
            height="30px"
            viewBox="0 0 1.8 1.8"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              width={48}
              height={48}
              fill="white"
              fillOpacity={0.01}
              d="M0 0H1.8V1.8H0V0z"
            />
            <path
              d="M0.675 1.162h0.75V0.188"
              stroke="currentColor"
              strokeWidth={0.15}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M1.125 0.787H0.375v0.825"
              stroke="currentColor"
              strokeWidth={0.15}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m1.65 0.412 -0.225 -0.225 -0.225 0.225"
              stroke="currentColor"
              strokeWidth={0.15}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="m0.6 1.387 -0.225 0.225 -0.225 -0.225"
              stroke="currentColor"
              strokeWidth={0.15}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg> */}
        </div>
      </div>
    </div>
  );
}

export default OrderCard