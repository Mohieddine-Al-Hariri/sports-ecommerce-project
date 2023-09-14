"use client"
import { useEffect, useRef, useState } from "react";
import OrderCard from "./OrderCard"
import SearchBar from "./SearchBar";
import { deleteOrder, getAdminOrders } from "@/lib";
import { useIsVisible } from "./UseVisible";
import { useRouter } from "next/navigation";
// import Link from "next/link";

const AdminOrders = ({ orders, hasNextPage, searchText, filteredState }) => {
  const [ordersState, setOrdersState] = useState([]);
  //Pagination
  const [lastOrderCursor, setLastOrderCursor] = useState(orders[orders.length - 1]?.cursor);
  const [doesHaveNextPage, setDoesHaveNextPage] = useState(hasNextPage);
  const lastOrderCardRef = useRef();
  const isLastOrderCardVisible = useIsVisible(lastOrderCardRef);
  const [isFirstRedner, setIsFirstRender] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedState, setSelectedState] = useState(filteredState || "All");
  const [resetSearchText, setResetSearchText] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isDarkModeLocal = JSON.parse(localStorage.getItem("isDarkMode"));
    if(isDarkModeLocal) document.body.classList.add('dark');
    else document.body.classList.remove('dark');
  }, []);

  const getMoreOrders = async () => {
    const paginatedOrders = await getAdminOrders(lastOrderCursor, searchText, filteredState);
    return paginatedOrders;
  }
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

  useEffect(() => {
    setOrdersState(orders);
    setDoesHaveNextPage(hasNextPage);
  },[orders, hasNextPage])

  const allState = ["All", "Ordered", "Delivering", "Recieved", "Cancelled", "Deleted"];
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

  const handleNavigation = (state) => {
    const currentParams = new URLSearchParams(window.location.search);
    if(state === 'All') currentParams.delete("filteredState");
    else currentParams.set("filteredState", state);
    currentParams.delete("cursor");
    currentParams.delete("search");

    const newSearchParams = currentParams.toString();
    const newPathname = `${window.location.pathname}?${newSearchParams}`;
    setResetSearchText(!resetSearchText);
    router.push(newPathname);
  };
  useEffect(() => {
    handleNavigation(selectedState);
  },[selectedState])

  const handleDeleteOrder = async (id) => {
    await deleteOrder(id);
    router.refresh();
  }

  let array = [orderedState, deliveringState, recievedState, cancelledState, deletedState];
  array = array.filter((item) => item.length > 0);
  return ( //TODO: Make it responsive
    <div className='flex flex-col items-center justify-between p-4 pb-20 h-screen w-screen bgColor overflow-y-scroll overflow-x-hidden fontColor ' >
      
      <div className="mb-4 ">
        <SearchBar resetSearchText={resetSearchText} />
        <div className="my-4">
          <label htmlFor="state" className="block text-lg font-semibold mb-2">
            Filter by State
          </label>
          <select
            id="state"
            name="state"
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full colorScheme py-2 px-4 border rounded focus:outline-none focus:ring focus:border-[#4bc0d9]"
          >
            {allState.map((state, index) => (
              <option className="fontColor" key={state} >{state}</option>
            ))}
          </select>
        </div>
      </div>
      {/* {ordersState.map((order) => (
        <OrderCard key={order.node.id} order={order.node} />
      ))} */}
        {array.map((item) => (
          <div key={item[0].node.id}>
            <h1 className="p-2 pb-0 text-xl font-semibold w-full text-center border-b-2 opBorderColor ">{item[0].node.state}</h1>
            <div className="sm:flex flex-wrap">
              {item.map((order) => (
                <OrderCard key={order.node.id} order={order.node} handleDeleteOrder={handleDeleteOrder} />
              ))}
            </div>
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