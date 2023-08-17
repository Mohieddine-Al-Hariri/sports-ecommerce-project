import { getCategories, getProducts } from "@/lib";
import { AdminProductsPage } from "@/app/components";


export async function getCategoriesData() {
  const Categories = (await getCategories()) || [];
  return Categories;
}
export async function getProductsData(searchText, category) {
  const products = (await getProducts(undefined, searchText, category, true)) || [];
  return products;
}
const page = async ({ searchParams: { searchText, category } }) => {
  const categoriesData = await getCategoriesData();
  const productsData = await getProductsData(searchText, category);

  return <AdminProductsPage 
      products={productsData.products} 
      searchText={searchText} 
      categoriesData={categoriesData} 
      hasNextPage={productsData.pageInfo.hasNextPage}
    />
}

export default page