"use client";
import { useState } from "react";
import Select from "react-select";
import ReactMarkdown from "react-markdown";
import {
  createProduct,
  publishImagesUrls,
  publishProduct,
  publishProductVariants,
} from "@/lib";
import { useRouter } from "next/navigation";
import { v4 } from "uuid";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebaseConfig";
import { CheckBox, SVGLoading } from ".";

const PillVariant = ({ size, color, index, deleteItem, quantity, decreaseQuantity, increaseQuantity, infiniteQuantity }) => {

  return (
    <div className="flex flex-col items-center px-3 py-1 productCardBg rounded-full">
      {/*  */}
      <div>
        {size && size} {size && color && "/"} {color && color}
        <button className="text-red-600 ml-2" onClick={(e) => {deleteItem(index); e.preventDefault()}}>
          X
        </button>
      </div>
      {/*  */}
      <div className="flex gap-2">
        <button className="rounded-full bgColorGray aspect-square px-2 " onClick={(e) => decreaseQuantity(e, index)}>-</button>
        <button onClick={(e) => infiniteQuantity(e, index)}>♾️</button>
        <button className="rounded-full bgColorGray aspect-square px-2 " onClick={(e) => increaseQuantity(e, index)}>+</button>
      </div>
        {quantity !== null ? quantity : "⊠"}
    </div>
  );
};

export const VariantsForm = ({ selectedPills, setSelectedPills }) => {

  const [showSizeInput, setShowSizeInput] = useState(false);
  const [showColorInput, setShowColorInput] = useState(false);
  const [sizeValues, setSizeValues] = useState([]);
  const [colorValues, setColorValues] = useState([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const infiniteQuantity = (e, index) => {
    e.preventDefault();
    setSelectedPills(prev => prev.map((pill, i) => {
      if(i === index) {
        return {
          ...pill,
          quantity: null
        }
      }
      return pill
    }))
  }
  const decreaseQuantity = (e, index) => {
    e.preventDefault();
    if(!selectedPills[index].quantity || selectedPills[index].quantity === 0 ) return
    // else if(selectedPills[index].quantity === 1){
    //   setSelectedPills(prev => prev.map((pill, i) => {
    //     if(i === index) {
    //       return {
    //         ...pill,
    //         quantity: null
    //       }
    //     }
    //     return pill
    //   }))
    //   return
    // }
    setSelectedPills(prev => prev.map((pill, i) => {
      if(i === index) {
        return {
          ...pill,
          quantity: pill.quantity - 1
        }
      }
      return pill
    }))
  }
  const increaseQuantity = (e, index) => {
    e.preventDefault();
    setSelectedPills(prev => prev.map((pill, i) => {
      if(i === index) {
        return {
          ...pill,
          quantity: pill.quantity ? pill.quantity + 1 : 1
        }
      }
      return pill
    }));
  }
  const deleteItem = (index) => {
    const updatedPills = selectedPills.filter((_, i) => i !== index);
    setSelectedPills(updatedPills);
  };
  const cancel = () => {
    setShowSizeInput(false);
    setShowColorInput(false);
  }
  const clearAll = () => {
    setSizeValues([]);
    setColorValues([]);
    setSelectedPills([]);
    setHasSubmitted(false);
  }
  const handleSubmitVariants = (e) => {
    e.preventDefault();
    if (showSizeInput && showColorInput) {
      let pills = sizeValues.map((size) =>
        colorValues.map((color) => ({ name: `${size}/${color}`, size, color, quantity: 1 }))
      );
      setSelectedPills(pills.flat());
      setShowSizeInput(false);
      setShowColorInput(false);
    } else if (showSizeInput) {
      setSelectedPills(sizeValues.map((size) => ({ size, quantity: 1 })));
      setShowSizeInput(false);
    } else if (showColorInput) {
      setSelectedPills(colorValues.map((color) => ({ color, quantity: 1 })));
      setShowColorInput(false);
    } else {
      setShowSizeInput(false);
      setShowColorInput(false);
    }
    setHasSubmitted(true);
  };


  return(
    <div className="relative mb-4 border-2 border-gray-300 rounded p-2 ">
      <label className="block text-lg font-semibold mb-2">
        Filter by Variants
      </label>
      {(showSizeInput || showColorInput) &&
        <button className="absolute top-2 right-2" onClick={cancel}>X</button>
      }
      <div className="flex space-x-4 mb-2 ">
        <div
          className={`cursor-pointer p-2 border rounded hover:text-white hover:bg-[#4bc0d9] ${
            showSizeInput ? "border-[#4bc0d9]" : "border-gray-300"
          }`}
          onClick={() => {
            setShowSizeInput(!showSizeInput);
            setShowColorInput(false);
          }}
        >
          Size
        </div>
        <div
          className={`cursor-pointer p-2 border rounded hover:text-white hover:bg-[#4bc0d9] ${
            showColorInput ? "border-[#4bc0d9]" : "border-gray-300"
          }`}
          onClick={() => {
            setShowColorInput(!showColorInput);
            setShowSizeInput(false);
          }}
        >
          Color
        </div>
        <div
          className={`cursor-pointer p-2 border rounded hover:text-white hover:bg-[#4bc0d9] ${
            showSizeInput && showColorInput
              ? "border-[#4bc0d9]"
              : "border-gray-300"
          }`}
          onClick={() => {
            setShowSizeInput(true);
            setShowColorInput(true);
          }}
        >
          Size & Color
        </div>
      </div>
      {showSizeInput && (
        <div className="mb-2">
          <label className="block font-semibold mb-1">Size</label>
          <input
            type="text"
            placeholder="Size"
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-[#4bc0d9]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value) {
                e.preventDefault();
                setSizeValues([...sizeValues, e.target.value]);
                e.target.value = "";
              }
            }}
          />
          <div className="mt-2 flex flex-col gap-1">
            {sizeValues.map((value, index) => (
              <div
                key={index}
                className="flex justify-between items-center border rounded px-2 py-1 productCardBg"
              >
                {value}
                <button
                  className="text-red-600"
                  onClick={(e) => {
                    e.preventDefault();
                    const updatedValues = sizeValues.filter(
                      (_, i) => i !== index
                    );
                    setSizeValues(updatedValues);
                  }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showColorInput && (
        <div className="mb-2">
          <label className="block font-semibold mb-1">Color</label>
          <input
            type="text"
            placeholder="Color"
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-[#4bc0d9]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.target.value) {
                e.preventDefault();
                setColorValues([...colorValues, e.target.value]);
                e.target.value = "";
              }
            }}
          />
          <div className="mt-2 flex flex-col gap-1">
            {colorValues.map((value, index) => (
              <div
                key={index}
                className="flex justify-between items-center border rounded px-2 py-1 productCardBg"
              >
                {value}
                <button
                  className="text-red-600"
                  onClick={() => {
                    const updatedValues = colorValues.filter(
                      (_, i) => i !== index
                    );
                    setColorValues(updatedValues);
                  }}
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {showSizeInput || showColorInput ? (
        <button
          className="hover:bg-[#3ca8d0] bg-[#4bc0d9] text-white py-2 px-4 rounded cursor-pointer"
          onClick={(e) => handleSubmitVariants(e)}
        >
          Check
        </button>
      ) : null}
      {hasSubmitted && (
        <div className="flex flex-wrap gap-2 mt-4">
          {selectedPills.map((pill, index) => (
            <PillVariant
              key={
                (pill.size && pill.color && `${pill.size}/${pill.color}`) ||
                (pill.size && `${pill.size}`) ||
                (pill.color && `${pill.color}`)
              }
              size={pill.size || null}
              color={pill.color || null}
              index={index}
              deleteItem={deleteItem}
              decreaseQuantity={decreaseQuantity}
              increaseQuantity={increaseQuantity}
              infiniteQuantity={infiniteQuantity}
              quantity={pill.quantity}
            />
          ))}
          {selectedPills.length > 0 && (
            <button onClick={clearAll} >Clear All</button>
          )}
        </div>
      )}
    </div>
  );
};

const CreateProductForm = ({ categoriesData, isDarkMode, collectionsData }) => {
  const [images, setImages] = useState([]);
  const [form, setForm] = useState({
    name: "",
    excerpt: "",
    description: "",
    collections: [],
    state: "Available",
    categories: [],
  });
  const [price, setPrice] = useState(0); 
  const [prevPrice, setPrevPrice] = useState(0); 
  const [imageError, setImageError] = useState("");
  const [isOnSale, setIsOnSale] = useState(false);

  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  const [selectedPills, setSelectedPills] = useState([]); //Variants State

  const handleImageUpload = (event) => {
    const newImages = Array.from(event.target.files);

    const invalidFiles = newImages.filter(
      (file) => file.type.indexOf("image/") !== 0
    );

    if (invalidFiles.length > 0) {
      setImageError("Invalid file format. Please upload images only.");
      return;
    }

    setImageError("");
    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const categoryOptions = categoriesData.map((category) => {
    return { value: category.id, label: category.name, className: "fontColor bgColor" };
  });
  const collectionOptions = collectionsData.map((collection) => {
    return { value: collection.id, label: collection.name, className: "fontColor bgColor" };
  });

  const handleCategoryChange = (selectedOptions) => {
    const selectedCategories = selectedOptions.map((option) => option.value);
    setForm((prevForm) => ({ ...prevForm, categories: selectedCategories }));
  };
  const handleCollectionChange = (selectedOptions) => {
    const selectedCollection = selectedOptions.map((option) => option.value);
    setForm((prevForm) => ({ ...prevForm, collections: selectedCollection }));
  };

  async function uploadImage(image) {
    const storageRef = ref(
      storage,
      `/products/${form.name}/${Date.now()}-${image.name}`
    );

    const response = await uploadBytes(storageRef, image);
    const url = await getDownloadURL(response.ref);
    return url;
  }
  async function uploadImages() {
    const imagePromises = Array.from(images, (image) => uploadImage(image));

    const imageRes = await Promise.all(imagePromises);
    return imageRes; // list of url like ["https://..", ...]
  }
  const handleSubmit = async (event) => { //TODO: ADD Image Compression before upload
    event.preventDefault();
    setIsCreating(true);
    const imgUrls = await uploadImages();
    const slug = v4();
    const createdProduct = await createProduct({
      ...form,
      imgUrls,
      slug,
      price,
      variants: selectedPills,
      isOnSale,
      previousPrice: isOnSale ? prevPrice : 0,
    });

    const publishProductPromise = publishProduct(createdProduct.id);
    const publishImagesUrlsPromise = publishImagesUrls(createdProduct.imageUrls);
    const publishProductVariantsPromise = publishProductVariants(createdProduct.productVariants);
    await Promise.all([publishProductPromise, publishImagesUrlsPromise, publishProductVariantsPromise]);
    router.push(`/itemsDetails/${createdProduct.id}`);
    setIsCreating(false);
  };

  const reactSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: "bgColor", // Adjust the background color
      borderColor: "borderColor", // Adjust the border color
      color: "fontColor", // Adjust the text color
      '&:hover': {
        borderColor: "#00FFFF", // Adjust the hover border color
      },
    }),
    option: (provided, { isFocused, isSelected }) => ({
      ...provided,
      backgroundColor: isFocused || isSelected ? "#4bc0d9" : "white", // Adjust the background color for selected options
      color: isFocused || isSelected ? "white" : "black", // Adjust the text color
      '&:hover': {
        backgroundColor: "#4bc0d9", // Adjust the hover background color
      },
    }),
    // Other style overrides as needed...
  };
  
  
  return (
    <div className="max-w-2xl mx-auto p-6 bgColor colorScheme fontColor shadow-md rounded-lg fontColor overflow-y-scroll pb-16">
      <h2 className="text-3xl font-semibold mb-6">Create a Product</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        <div className="mb-4">
          <label htmlFor="images" className="block text-lg font-semibold mb-2">
            Images
          </label>
          <input
            type="file"
            id="images"
            accept="image/*"
            required
            multiple
            onChange={handleImageUpload}
            className="py-2 px-4 border rounded focus:outline-none focus:ring focus:border-[#4bc0d9]"
          />

          {imageError && <p className="text-red-500 text-sm">{imageError}</p>}

          <div className="flex space-x-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Product ${index}`}
                  className="w-32 h-32 object-cover rounded"
                />
                <span
                  className="absolute top-0 right-0 text-white bg-red-500 rounded-full p-1 cursor-pointer"
                  onClick={() => handleRemoveImage(index)}
                >
                  X
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="name" className="block text-lg font-semibold mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-[#4bc0d9]"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="excerpt" className="block text-lg font-semibold mb-2">
            Excerpt
          </label>
          <input
            type="text"
            id="excerpt"
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-[#4bc0d9]"
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-lg font-semibold mb-2"
          >
            Description (Markdown)
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-[#4bc0d9]"
            rows="6"
          />
          <ReactMarkdown className="prose mt-2 ">
            {form.description}
          </ReactMarkdown>
        </div>

        <CheckBox label="Is Product On Sale?" isChecked={isOnSale} setIsChecked={setIsOnSale}/>

        <div className="mb-4 flex gap-2 " >
          <label htmlFor="price" className="block text-lg font-semibold mb-2 w-full">
            Price
            <div className="flex items-center border rounded focus-within:border-[#4bc0d9]">
              <span className="fontColorGray px-3">$</span>
              <input
                type="number"
                id="price"
                required
                name="price"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                className="w-full py-2 px-2 rounded focus:outline-none focus:ring focus:border-[#4bc0d9]"
              />
            </div>
          </label>
          {/* {isNaN(parseFloat(form.price)) && form.price.trim() !== '' && (
            <p className="text-red-500 text-sm mt-1">Please enter a valid price.</p>
          )} */}
          {isOnSale && (
            <>
              <label htmlFor="previousPrice" className="block text-lg font-semibold mb-2 w-full">
                Previous Price
                <div className="flex items-center border rounded focus-within:border-[#4bc0d9]">
                  <span className="fontColorGray px-3">$</span>
                  <input
                    type="number"
                    id="previousPrice"
                    required
                    name="previousPrice"
                    value={prevPrice}
                    onChange={(e) => setPrevPrice(parseFloat(e.target.value))}
                    className="w-full py-2 px-2 rounded focus:outline-none focus:ring focus:border-[#4bc0d9]"
                  />
                </div>
              </label>
            </>
          )}
        </div>

        <div className="mb-4">
          <label
            htmlFor="categories"
            className="block text-lg font-semibold mb-2"
          >
            Categories
          </label>
          <Select
            id="categories"
            name="categories"
            isMulti
            options={categoryOptions}
            value={categoryOptions.filter((option) =>
              form.categories.includes(option.value)
            )}
            styles={reactSelectStyles}
            // styles={isDarkMode ? reactSelectStyles : null}
            onChange={handleCategoryChange}
            className="py-2 px-4 border rounded focus:outline-none focus:ring focus:border-[#4bc0d9] "
          />
        </div>

        <VariantsForm selectedPills={selectedPills} setSelectedPills={setSelectedPills} />

        <div className="mb-4">
          <label
            htmlFor="collections"
            className="block text-lg font-semibold mb-2"
          >
            Collection
          </label>
          <Select
            id="collections"
            name="collections"
            isMulti
            options={collectionOptions}
            value={collectionOptions.filter((option) =>
              form.collections.includes(option.value)
            )}
            styles={reactSelectStyles}
            // styles={isDarkMode ? reactSelectStyles : null}
            onChange={handleCollectionChange}
            className="py-2 px-4 border rounded focus:outline-none focus:ring focus:border-[#4bc0d9] "
          />
        </div>

        <div className="mb-4">
          <label htmlFor="state" className="block text-lg font-semibold mb-2">
            State
          </label>
          <select
            id="state"
            name="state"
            value={form.state}
            onChange={handleChange}
            className="w-full py-2 px-4 border rounded focus:outline-none focus:ring focus:border-[#4bc0d9]"
          >
            <option value="Available">Available</option>
            <option value="Out Of Stock">Out Of Stock</option>
            <option value="Removed">Removed</option>
          </select>
        </div>

        {isCreating ? 
          <button disabled type="button" className="py-3 px-6 rounded mr-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center">
            <SVGLoading className="inline w-4 h-4 mr-3 text-gray-200 animate-spin dark:text-gray-600 fill-[#4bc0d9]" />
            Creating...
          </button>
        :
          <button
            type="submit"
            className="hover:bg-[#3ca8d0] bg-[#4bc0d9] text-white py-3 px-6 rounded focus:outline-none focus:ring focus:border-[#4bc0d9]"
          >
            Create Product
          </button>
        }

      </form>
    </div>
  );
};

export default CreateProductForm;
