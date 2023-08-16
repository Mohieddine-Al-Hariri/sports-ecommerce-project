"use client"
import { useEffect, useRef, useState } from "react";
import OrderCard from "./OrderCard"
import SearchBar from "./SearchBar";
import { getAdminOrders } from "@/lib";
import { useIsVisible } from "./UseVisible";

const AdminOrders = ({ orders, hasNextPage, searchText, filteredState }) => {
  const [ordersState, setOrdersState] = useState(orders);
  //Pagination
  const [lastOrderCursor, setLastOrderCursor] = useState(orders[orders.length - 1]?.cursor);
  const [doesHaveNextPage, setDoesHaveNextPage] = useState(hasNextPage);
  const lastOrderCardRef = useRef();
  const isLastOrderCardVisible = useIsVisible(lastOrderCardRef);
  const [isFirstRedner, setIsFirstRender] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const getMoreOrders = async () => {
    const paginatedOrders = await getAdminOrders(lastOrderCursor, searchText, filteredState);
    return paginatedOrders;
  }
  console.log(ordersState);
  useEffect(() => {
    if(isFirstRedner){
      setIsFirstRender(false);
    }
    else if(doesHaveNextPage && !isLoading){
      setIsLoading(true);
      getMoreOrders().then((result) => {    
        result.pageInfo.hasNextPage && setLastOrderCursor(result.orders[result.orders.length - 1].cursor); //result.ordersConnection.edges
        setDoesHaveNextPage(result.pageInfo.hasNextPage);
        setOrdersState([ ...ordersState, ...result.orders]);
        setIsFirstRender(true);
        setIsLoading(false);
      });
    }
  },[isLastOrderCardVisible]);

  let orderedState = [], 
  deliveringState = [], 
  recievedState = [], 
  cancelledState = [], 
  deletedState = [];

  ordersState.map((order) => {
    if(order.node.state === "Ordered") orderedState.push(order);
    else if( order.node.state === "Recieved" ) recievedState.push(order);
    else if( order.node.state === "Delivering" ) deliveringState.push(order);
    else if( order.node.state === "Cancelled" ) cancelledState.push(order);
    else if( order.node.state === "Deleted" ) deletedState.push(order);
  })

  let array = [orderedState, deliveringState, recievedState, cancelledState, deletedState];
  array = array.filter((item) => item.length > 0);
  // console.log("array: ", array);
  return (
    <div className='flex flex-col items-center justify-between p-4 h-screen w-screen bg-white overflow-y-scroll overflow-x-hidden fontColor ' >
      <SearchBar />
      <h1 className="p-2 text-2xl font-semibold border-b-2 border-black mb-4 ">Orders</h1>
      {array.map((item) => (
        <div>
          <h1 className="p-2 text-xl font-semibold ">{item[0].node.state}</h1>
          {item.map((order) => (
            <OrderCard key={order.node.id} order={order.node} />
          ))}
        </div>
      ))}
      {/* Pagination controls */}
      {isLoading && <div className="flex relative h-40 w-full backGround fontColor text-2xl justify-center items-center rounded-lg ">Loading...</div> }
      {!doesHaveNextPage && <div className="flex relative h-40 w-full backGround fontColor text-2xl justify-center items-center rounded-lg ">All Done! </div> }
      {/* Add an invisible element to act as the previousPostCardRef */}
      <div ref={lastOrderCardRef} style={{ visibility: "hidden" }} />
      
    </div>
  )
}

export default AdminOrders