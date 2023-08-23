"use client";
import { useEffect, useRef, useState } from "react";
import { useIsVisible } from "./UseVisible";
import CreateProductForm from "./CreateProductForm";
import { AdminProductCard } from ".";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";
import { getProducts } from "@/lib";

const AdminProductsPage = ({ products, hasNextPage, searchText, categoriesData, searchedCategory }) => {

  const [productsState, setProductsState] = useState([]);
  const [lastProductCursor, setLastProductCursor] = useState(products[products.length - 1]?.cursor);
  const [isCreating, setIsCreating] = useState(false);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [doesHaveNextPage, setDoesHaveNextPage] = useState(hasNextPage);
  const lastProductCardRef = useRef();
  const isLastProductCardVisible = useIsVisible(lastProductCardRef);
  const [resetSearchText, setResetSearchText] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(searchedCategory || 'All');
  const router = useRouter();




  const getMoreProducts = async () => {
    const searchedCategory = undefined; //Make it related to collections later...
    //TODO: create an env var specific for this pagination...
    const paginatedProducts = await getProducts(lastProductCursor, searchText, searchedCategory);
    return paginatedProducts;
  }
  useEffect(() => {
    //TODO: Create a env var specific for this pagination, make the key limited to reading products only
    if(isFirstRender){
      setIsFirstRender(false);
    }
    else if(doesHaveNextPage && !isLoading){
      setIsLoading(true);
      getMoreProducts().then((result) => {    
        result.pageInfo.hasNextPage && setLastProductCursor(result.products[result.products.length - 1].cursor);
        setDoesHaveNextPage(result.pageInfo.hasNextPage);
        setProductsState([ ...productsState, ...result.products]);
        setIsFirstRender(true);
        setIsLoading(false);
      });
    }
  },[isLastProductCardVisible]);

  useEffect(() => {
    setProductsState(products);
    setDoesHaveNextPage(hasNextPage);
  },[products, hasNextPage])

  const handleNavigation = (category) => {
    const currentParams = new URLSearchParams(window.location.search);
    if(category === 'All') currentParams.delete("category");
    else currentParams.set("category", category);
    currentParams.delete("cursor");
    currentParams.delete("search");

    const newSearchParams = currentParams.toString();
    const newPathname = `${window.location.pathname}?${newSearchParams}`;
    // TODO: Change states in parent component to the new category and pageInfo ...
    setResetSearchText(!resetSearchText);
    router.push(newPathname);
  };
  useEffect(() => {
    handleNavigation(selectedCategory);
  },[selectedCategory])

  return (
    <div className="overflow-y-scroll bg-white fontColor ">
      <div className="p-2 ">
        <button onClick={() => setIsCreating(!isCreating)} className="border-2 border-black rounded-lg p-2 fontColor w-full ">{isCreating ? "Products" : "Create"}</button>
      </div>
      {isCreating?
        <CreateProductForm categoriesData={categoriesData} />
        :
        <div className="flex flex-col gap-2 p-1 ">
          <SearchBar resetSearchText={resetSearchText} />
          <div className="mb-4">
            <label htmlFor="category" className="block text-lg font-semibold mb-2">
              Filter by Category
            </label>
            <select
              id="category"
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-blue-500"
            >
              <option value="All">All</option>
              {categoriesData.map((category, index) => (
                <option className="fontColor" href={`/categories/${category.slug}`} key={category.name} >{category.name}</option>
              ))}
            </select>
          </div>
          {productsState.map(({node}) => (
            <AdminProductCard
              key={node.id}
              product= {node}
              hasNextPage = {hasNextPage}
              // categories={categoriesData} 
            />
          ))}
          {/* Pagination controls */}
          {isLoading && <div className="flex relative h-40 w-full backGround fontColor text-2xl justify-center items-center rounded-lg ">Loading...</div> }
          {!doesHaveNextPage && <div className="flex relative h-40 w-full backGround fontColor text-2xl justify-center items-center rounded-lg ">All Done! </div> }
          {/* Add an invisible element to act as the previousPostCardRef */}
        </div>
      }
      <div ref={lastProductCardRef} style={{ visibility: "hidden" }} />
    </div>
  )
}

export default AdminProductsPage
