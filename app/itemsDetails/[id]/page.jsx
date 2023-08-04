import ItemsDetailsPage from "@/app/components/ItemsDetailsPage";
import { getProductDetails } from "@/lib";

export async function getProductDetailsData(productId) {
  const productDetails = (await getProductDetails(productId)) || [];
  console.log("productDetails in func: ", productDetails)
  return productDetails;
}

export const dynamic = 'force-dynamic';
export const dynamicParams = true;
export const revalidate = 0;

const itemDetails = async ({ params }) => {
  console.log("params: ", params)

  const productDetails = await getProductDetails(params.id); 

  return <ItemsDetailsPage product={productDetails} />
  
}

export default itemDetails