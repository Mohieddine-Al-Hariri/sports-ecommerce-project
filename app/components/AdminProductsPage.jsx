"use client";
import { useEffect, useRef, useState } from "react";
import { useIsVisible } from "./UseVisible";
import CreateProductForm from "./CreateProductForm";
import { AdminProductCard } from ".";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";
import { getProducts } from "@/lib";

const AdminProductsPage = ({ products, hasNextPage, searchText, categoriesData, searchedCategory, collectionsData, searchedCollection }) => {

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
  const [selectedCollection, setSelectedCollection] = useState(searchedCollection || 'All');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const isDarkModeLocal = JSON.parse(localStorage.getItem("isDarkMode"));
    if(isDarkModeLocal) {
      document.body.classList.add('dark');
      setIsDarkMode(true);
    } 
    else {
      document.body.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, [])


  const getMoreProducts = async () => {
    const isSearchedCategory = searchedCategory || undefined; 
    const isSearchedCollection = searchedCollection || undefined; 
    const paginatedProducts = await getProducts(lastProductCursor, searchText, isSearchedCategory, isSearchedCollection, true);
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

  const handleNavigation = (category, collection) => {
    const currentParams = new URLSearchParams(window.location.search);
    if(category === 'All') currentParams.delete("category");
    else currentParams.set("category", category);
    if(collection === 'All') currentParams.delete("collection");
    else currentParams.set("collection", collection);
    currentParams.delete("cursor");
    currentParams.delete("search");
    // currentParams.delete("category");

    const newSearchParams = currentParams.toString();
    const newPathname = `${window.location.pathname}?${newSearchParams}`;
    // TODO: Change states in parent component to the new category and pageInfo ...
    setResetSearchText(!resetSearchText);
    router.push(newPathname);
  };
  useEffect(() => {
    handleNavigation(selectedCategory, selectedCollection);
  },[selectedCategory, selectedCollection])

  return (
    <div className="overflow-y-scroll bgColor fontColor ">
      <div className="p-2 ">
        <button onClick={() => setIsCreating(!isCreating)} className="border-2 borderColor rounded-lg p-2 fontColor w-full hover:border-[#4bc0d9] hover:bg-[#4bc0d9] hover:text-white ">{isCreating ? "Products" : "Create"}</button>
      </div>
      {isCreating?
        <CreateProductForm categoriesData={categoriesData} isDarkMode={isDarkMode} collectionsData={collectionsData} />
        :
        <div className="flex flex-col gap-2 p-1 bgColor ">
          <div className="lg:flex lg:justify-center lg:items-end lg:mb-4 gap-2">
            <SearchBar resetSearchText={resetSearchText} />
            <div className="flex gap-2 justify-center">
              <div className="mb-4 lg:mb-0 ">
                <label htmlFor="category" className="block text-lg font-semibold mb-2 pr-2 border-r-2 borderColorGray ">
                  Filter by Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className={`w-full colorScheme py-2 px-4 border rounded focus:outline-none focus:ring focus:border-[#4bc0d9] ${selectedCategory !== "All" && "border-red-500 "}`}
                >
                  <option value="All">All</option>
                  {categoriesData.map(category => (
                    <option className="fontColor" href={`/categories/${category.slug}`} key={category.name} >{category.name}</option>
                  ))}
                </select>
              </div>
                <div className="mb-4 lg:mb-0">
                  <label htmlFor="category" className="block text-lg font-semibold mb-2 pl-2 border-l-2 borderColorGray ">
                    Filter by Collection
                  </label>
                  <select
                    id="collection"
                    name="collection"
                    value={selectedCollection}
                    onChange={(e) => setSelectedCollection(e.target.value)}
                    className={`w-full colorScheme py-2 px-4 border rounded focus:outline-none focus:ring focus:border-[#4bc0d9] ${selectedCollection !== "All" && "border-red-500"}`}
                  >
                    <option value="All">All</option>
                    {collectionsData.map((collection, index) => (
                      <option className="fontColor" href={`/categories/${collection.slug}`} key={collection.name} >{collection.name}</option>
                    ))}
                  </select>
                </div>
            </div>
          </div>
          <div className="flex lg:flex-wrap max-lg:flex-col gap-2 bgColor ">
            {productsState.map(({node}) => (
              <AdminProductCard
                key={node.id}
                product= {node}
                hasNextPage = {hasNextPage}
                // categories={categoriesData} 
              />
            ))}
          </div>
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
