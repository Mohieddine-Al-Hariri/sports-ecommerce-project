import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getAdminOrders } from "@/lib";
import { AdminOrders } from "../../components";

export async function getAllOrders(cursor, searchText, filteredState) {
  const allOrders = (await getAdminOrders(cursor, searchText, filteredState)) || [];
  return allOrders;
}

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

const page = async ({ searchParams: { cursor, searchText, filteredState } }) => {
  const session = await getServerSession(authOptions);
  if(!session) {
    redirect('/SignIn');
  }
  const allOrdersData = await getAllOrders(cursor, searchText, filteredState);

  return <AdminOrders 
    orders={allOrdersData.orders} 
    hasNextPage={allOrdersData.pageInfo.hasNextPage} 
    searchText={searchText} 
    filteredState={filteredState} 
  />
}

export default page