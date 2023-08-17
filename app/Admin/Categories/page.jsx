import AdminCategoriesPage from "@/app/components/AdminCategoriesPage";
import { getCategories } from "@/lib";


export async function getCategoriesData() {
  const Categories = (await getCategories()) || [];
  return Categories;
}
const page = async () => {

  const categoriesData = await getCategoriesData();

  return <AdminCategoriesPage categoriesData={categoriesData} />
}

export default page