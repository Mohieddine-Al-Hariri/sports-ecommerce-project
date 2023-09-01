import UpdateProductForm from "@/app/components/UpdateProductForm";
import { getCategories, getProductDetails } from "@/lib";

export async function getCategoriesData() {
  const Categories = (await getCategories()) || [];
  return Categories;
}
export async function getProductsData(id) {
  const products = (await getProductDetails(id)) || [];
  return products;
}

const page = async ({ params: { id } }) => {

  const categoriesData = await getCategoriesData();
  const productData = await getProductsData(id);

  return <UpdateProductForm categoriesData={categoriesData} productData={productData} />
}

export default page