"use client";
import { useEffect, useRef, useState } from "react";
import { useIsVisible } from "./UseVisible";
import CreateProductForm from "./CreateProductForm";
import { AdminProductCard, FilterSelect } from ".";
import SearchBar from "./SearchBar";
import { useRouter } from "next/navigation";
import { deleteProduct, getProducts } from "@/lib";

const AdminProductsPage = ({ products, hasNextPage, searchText, categoriesData, searchedCategory, collectionsData, searchedCollection }) => {

  const [productsState, setProductsState] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  
  const [lastProductCursor, setLastProductCursor] = useState(products[products.length - 1]?.cursor);
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [doesHaveNextPage, setDoesHaveNextPage] = useState(hasNextPage);

  const lastProductCardRef = useRef();
  const isLastProductCardVisible = useIsVisible(lastProductCardRef);
  const [resetSearchText, setResetSearchText] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [deletedProductId, setDeletedProductId] = useState(null);

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
    setProductsState(() => {
    //Removes Deleted Product From State
    const updatedProducts = deletedProductId
        ? [...products.filter(product => product.node.id !== deletedProductId)]
        : products;
      return updatedProducts;
    });
    setDoesHaveNextPage(hasNextPage);
  },[products, hasNextPage])

  const deleteProductFromDb = async (productId) => {
    const deletedProduct = await deleteProduct(productId);
    router.refresh();
    setDeletedProductId(deletedProduct.id);
  }
  return (
    <div className="overflow-y-scroll h-full bgColor fontColor lg:pb-4 max-sm:pb-10 ">
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
              <FilterSelect 
                options={categoriesData} 
                searchedSelection={searchedCategory}
                filterBy="Category"
                setResetSearchText={setResetSearchText}
              />
              <FilterSelect 
                options={collectionsData} 
                searchedSelection={searchedCollection}
                filterBy="Collection"
                setResetSearchText={setResetSearchText}
              />
            </div>
          </div>
          <div className="flex lg:flex-wrap max-lg:flex-col gap-2 bgColor ">
            {productsState.map(({node}) => (
              <AdminProductCard
                key={node.id}
                product= {node}
                hasNextPage = {hasNextPage}
                deleteProductFromDb={deleteProductFromDb}
                // categories={categoriesData} 
              />
            ))}
          </div>
          {/* Pagination controls */}
          {isLoading && <div className="flex relative h-40 w-full backGround fontColor text-2xl justify-center items-center rounded-lg ">Loading...</div> }
          {/* An invisible element to act as the previousPostCardRef */}
          {!doesHaveNextPage && <div className="flex relative h-40 w-full backGround fontColor text-2xl justify-center items-center rounded-lg ">All Done! </div> }
        </div>
      }
      <div ref={lastProductCardRef} style={{ visibility: "hidden" }} />
    </div>
  )
}

export default AdminProductsPage
