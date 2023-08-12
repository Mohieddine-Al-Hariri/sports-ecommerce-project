"use client"
import Image from "next/image";
import { useState } from "react";

const OrderCard = ({ order }) => {
  const [checked, setChecked] = useState(false);
  // return (
  //   <div className="w-screen h-20 ">
  //     <div className="h-10 w-full ">
  //       <Image width={10} height={10} className="h-fit w-full " alt={"generalAlt"} src="/image 3.png" />
  //     </div>
  //   </div>
  // )
  console.log(order.orderItems)
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md w-64 m-4">
      <div className="h-32 overflow-hidden">
        <img src={order.orderItems[0].product.images[0].url} alt="Card" className="w-full h-full object-cover" />
      </div>
      <div className="p-4">
        <p className="text-base text-gray-700 mb-2">Total Price: ${order.total}</p>
        <h2 className="text-xl font-bold mb-2">{order.location}</h2>
        <p className="text-base text-gray-700 mb-4">Location: {order.id}</p>
        <button
          className={`bg-blue-500 text-white px-4 py-2 rounded ${
            checked ? 'bg-green-500' : ''
          }`}
          onClick={() => setChecked(!checked)}
        >
          {checked ? 'Checked' : 'Check'}
        </button>
      </div>
    </div>
  );
}

export default OrderCard