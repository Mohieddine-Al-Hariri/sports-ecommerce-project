import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getAdminOrders } from "@/lib";
import { AdminOrders } from "../components";

export async function getAllOrders(cursor, searchText) {
  const allOrders = (await getAdminOrders(cursor, searchText)) || [];
  // console.log("allOrders in func: ", allOrders)
  return allOrders;
}

const page = async ({ searchParams: { cursor, searchText, filteredState } }) => {
  const session = await getServerSession(authOptions);
  if(!session) {
    redirect('/SignIn');
  }
  console.log("cursor: ", cursor);
  // if(session.user.userRole !== "Admin") redirect('/');
  const allOrdersData = await getAllOrders(cursor, searchText);

  return <AdminOrders 
    orders={allOrdersData.orders} 
    hasNextPage={allOrdersData.pageInfo.hasNextPage} 
    searchText={searchText} 
    filteredState={filteredState} 
  />
}

export default page