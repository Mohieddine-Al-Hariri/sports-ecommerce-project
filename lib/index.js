import { request, gql } from 'graphql-request';
const graphqlAPI = process.env.GRAPHYL_ENDPOINT;
const graphqlPublicAPI = process.env.NEXT_PUBLIC_GRAPHYL_ENDPOINT;

export const getTheUser = async ( slug, isAdminPage ) => {
  const query = gql`
    query TheUser($slug: String!) {
      theUser(where: {slug: $slug}) {
        firstName
        lastName
        id
        email
        phoneNumber
        birthDate
        slug
        profileImageUrl
        location
        ${isAdminPage ? "userRole{ role }" : ""}
        cart {
          id
        }
        orderItems {
          product {
            slug
            price
            id
            imageUrls {
              url
            }
          }
        }
      }
    }
  `;
  const result = await request(graphqlAPI, query, { slug });
  return result.theUser;
}
export const publishUser = async (userSlug) => {
  try {
    const response = await fetch('/api/publishUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( userSlug ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const updateTheUser = async (updatedDetails) => { 
  try {
    const response = await fetch('/api/updateUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( updatedDetails ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const getProducts = async (cursor, searchText, category, collection , isAdmin) => {
  const querySearchtext = searchText ? searchText : ""; 
  const getPublished = !isAdmin ? ", state_not: Removed" : "";
  const categoryQuery = category ? `, categories_every: {name: $category}` : "";
  const collectionQuery = collection ? `, collections_every: {name: $collection}` : "";

  const query = gql`
  query MyQuery($querySearchtext: String, $cursor: String${category ? `, $category: String ` : ""}${collection ? `, $collection: String ` : ""}) {
    productsConnection(first: 9, after: $cursor, where: {_search: $querySearchtext${getPublished}${categoryQuery}${collectionQuery}}, orderBy: createdAt_DESC) {
        edges {
          cursor
          node {
            collections {
              name
              slug
            }
            id 
            excerpt
            imageUrls(first: 1) {
              url
            }
            reviews(last:10){
              id
              rating
            }
            name
            price
            slug
            ${isAdmin ? "state" : ""}
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;
  const result = await request(graphqlPublicAPI, query, { cursor, querySearchtext, category, collection });
  return {
    products: result.productsConnection.edges,
    pageInfo: {
      ...result.productsConnection.pageInfo
    },
  };
};
export const getProductsForCollections = async (searchText, cursorDetails) => {
  const querySearchtext = searchText ? searchText : "";
  const { cursor, beforeOrAfter } = cursorDetails?.beforeOrAfter ? cursorDetails : {cursor: undefined, beforeOrAfter: "after"};
  const query = gql`
  query MyQuery($querySearchtext: String, $cursor: String) {
    productsConnection(${beforeOrAfter === "before" ? "last" : "first" }: 8, ${beforeOrAfter}: $cursor, where: {_search: $querySearchtext}, orderBy: createdAt_DESC) {
        edges {
          cursor
          node {
            collections {
              id
              name
              slug
            }
            id 
            excerpt
            imageUrls(first: 1) {
              url
            }
            name
            slug
            state
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
        }
      }
    }
  `;
  const result = await request(graphqlPublicAPI, query, { querySearchtext, cursor });
  return {
    products: result.productsConnection.edges,
    pageInfo: {
      ...result.productsConnection.pageInfo
    },
  };
};
export const getProductDetails = async (productId) => {
  const query = gql`
    query GetProductDetails($productId : ID!) {
      product(where: {id: $productId}) {
        id
        name
        price
        slug
        excerpt
        state
        updatedAt
        description
        publishedBy {
          name
          id
          picture
        }
        imageUrls {
          url
          id
        }
        reviews{
          id
          headline
          rating
          content
          theUser {
            id
            firstName
            lastName
            profileImageUrl
          }
        }
        productVariants {
          id
          name
          quantity
        }
        variants {
          ... on ProductColorVariant {
            id
            name
            color
          }
          ... on ProductSizeColorVariant {
            id
            name
            color
            size
          }
          ... on ProductSizeVariant {
            id
            name
            size
          }
        }
        categories {
          id
          name
          slug
          stage
          show
          products(first: 4, orderBy: createdAt_DESC, where: {state_not: Removed, id_not: $productId}) {
            id
            name
            slug
            imageUrls(first: 1) {
              url
              id
            }
          }
        }
        collections {
          slug
          name
          products(first: 3) {
            imageUrls {
              url
            }
            slug
            name
          }
        }
      }
    }
  `;

  const result = await request(graphqlAPI, query, { productId });
  return result.product;
};
export const createProduct = async (productDetails) => {
  try {
    const response = await fetch('/api/createProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( productDetails ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const publishImagesUrls = async (imagesUrls) => {
  try {
    const response = await fetch('/api/publishImageUrl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( imagesUrls ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const publishProduct = async (productId) => {
  try {
    const response = await fetch('/api/publishProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( productId ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const updateProduct = async (productDetails) => {
  try {
    const response = await fetch('/api/updateProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( productDetails ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const updateProductState = async (product) => {
  try {
    const response = await fetch('/api/updateProductState', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( product ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createProductVariantSizeColor = async (variantDetails) => {
  try {
    const response = await fetch('/api/createProductVariant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( variantDetails ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export const publishProductVariants = async (productVariantsariantsIds) => {
  try {
    const response = await fetch('/api/publishProductVariants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( productVariantsariantsIds ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export const getCategories = async (isAdmin) => {
  const query = gql`
    query Categories {
      categories${!isAdmin ? `(where: {show: true})` : ""} {
        id
        name
        slug
        show
        description
        ${isAdmin ? 
          `
            products {
              id
              name
              slug
              description
              imageUrls(first: 1) {
                url
              }
            }
          `
          :""
        }
      }
    }
  `;
  const result = await request(graphqlAPI, query);
  return result.categories;
}
export const createCategory = async (categoryDetails) => {
  try {
    const response = await fetch('/api/createCategory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( categoryDetails ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const publishCategory = async (categoryId) => {
  try {
    const response = await fetch('/api/publishCategory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( categoryId ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const updateCategory = async (categoryDetails) => {
  try {
    const response = await fetch('/api/updateCategory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( categoryDetails ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export const updateCategoryState = async (categoryDetails) => {
  try {
    const response = await fetch('/api/updateCategoryShow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( categoryDetails ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export const deleteCategory = async (categoryId) => {
  try {
    const response = await fetch('/api/deletecategory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( categoryId ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getOrders = async (cursor, searchText, userId, isAdmin) => {
  const querySearchtext = searchText ? searchText : ""; 
  const query = gql`
  query Orders(${cursor ? `$cursor: String, ` : ""}$querySearchtext: String, $userId: ID) {
    ordersConnection(first: 10, where: {theUser: {id: $userId}, _search: $querySearchtext, isRemoved_not: true}, orderBy: createdAt_DESC) {
      edges {
        cursor
        node {
          id
          createdAt
          total
          state
          orderItems(first: 1) {
            id
            quantity
            total
            product {
              name
              imageUrls(first: 1) {
                url
              }
            }
            collection{
              name
              imageUrl
              products(first: 3){
                name
                imageUrls(first: 1) {
                  url
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
  
  `;
  const result = await request(graphqlAPI, query, { cursor, querySearchtext, userId });
  return {
    orders: result.ordersConnection.edges,
    pageInfo: {
      ...result.ordersConnection.pageInfo
    },
  };
};

export const getAdminOrders = async (cursor, searchText, filteredState) => {
  const querySearchtext = searchText ? searchText : ""; 
  const queryFilteredState = filteredState ? ", $filteredState: Tracking" : ""; 
  const query = gql`
    query Orders($cursor: String, $querySearchtext: String${queryFilteredState}) {
      ordersConnection(first: 10, after: $cursor, where: {_search: $querySearchtext${filteredState ? ", state: $filteredState" : ""}}, orderBy: createdAt_DESC) {
        edges {
          cursor
          node {
            id
            state
            createdAt
            total
            theUser{
              id
              slug
              firstName
              lastName
              email
              location
            }
            orderItems(first: 3) {
              id
              quantity
              total
              product {
                name
                imageUrls(first: 1) {
                  url
                }
              }
              collection{
                id
                name
                imageUrl
                products(first: 3){
                  id
                  name
                  imageUrls(first: 1) {
                    url
                  }
                }
              }
            }
            
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;
  const result = await request(graphqlPublicAPI, query, { cursor, querySearchtext, filteredState });
  return {
    orders: result.ordersConnection.edges,
    pageInfo: {
      ...result.ordersConnection.pageInfo
    },
  };
};
export const submitOrder = async (order) => {
  try {
    const response = await fetch('/api/submitOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( order ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const publishOrder = async (orderId) => {
  try {
    const response = await fetch('/api/publishOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( orderId ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const updateOrderState = async (updatedDetails) => {
  try {
    const response = await fetch('/api/changeOrderState', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( updatedDetails ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const deleteOrder = async (orderId) => {
  try {
    const response = await fetch('/api/deleteOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( orderId ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const removeOrder = async (orderId) => {
  try {
    const response = await fetch('/api/removeOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( orderId ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getOrderDetails = async (orderId) => {
  const query = gql`
    query Orders($orderId: ID) {
      order(where: {id: $orderId}) {
        id
        isRemoved
        state
        total
        theUser {
          location
          phoneNumber
          email
          firstName
          lastName
        }
        orderItems {
          id
          variant
          orderItemVariants{
            name
          }
          collection {
            id
            name
            imageUrl
            price
            description
            products {
              name
              imageUrls {
                url
              }
            }
          }
          product {
            excerpt
            id
            imageUrls {
              url
            }
            name
            price
            slug
            variants {
              ... on ProductColorVariant {
                id
                name
                color
              }
              ... on ProductSizeColorVariant {
                id
                name
                color
                size
              }
            }
          }
          quantity
          total
        }
      }
  }
  `;

  const result = await request(graphqlAPI, query, { orderId });
  return result.order;
};

export const getOrderProducts = async (orderId) => {
  const query = gql`
  query Order($orderId: ID) {
    order(where: {id: $orderId}) {
      id
      orderItems {
        id
        product {
          id
          name
          excerpt
          price
          rating
          imageUrls(first: 1) {
            url
          }
        }
        collection {
          id
          name
          imageUrl
          products {
            id
            name
            excerpt
            price
            rating
            imageUrls(first: 1) {
              url
            }
          }
        }
      }
    }
  }
  
  `;
  const result = await request(graphqlAPI, query, { orderId });
  return result.order
};
export const reviewProduct = async (productDetails) => {
  try {
    const response = await fetch('/api/reviewProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( productDetails ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const publishReview = async (reviewId) => {
  try {
    const response = await fetch('/api/review/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( reviewId ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null
  }
}
export const disconnectItemFromOrder = async (ids) => { //after review, disconnect from order
  try {
    const response = await fetch('/api/orderItem/disconnectFromOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( ids ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null
  }
}

export const getCart = async (searchText, cartId, isAdmin) => {
  //If you need to use pagination, use orderItemsConnection instead of cart....
  //If needed, make the cart 2 way reference with user??
  const querySearchtext = searchText ? searchText : ""; 
  const query = gql`
    query Cart($cartId: ID, $querySearchtext: String) {
      cart(where: {id: $cartId}) {
        orderItems(where: {_search: $querySearchtext}) {
          id
          quantity
          total
          variant
          product {
            id
            imageUrls(first: 1) {
              url
            }
            name
            price
            slug
          }
          collection{
            id
            name
            slug
            price
            imageUrl
            products{
              id
              name
              slug
              price
              imageUrls(first: 1) {
                url
              }
            }
          }
        }
      }
    }
  `;
  const result = await request(graphqlAPI, query, { querySearchtext, cartId });
  return result.cart
};
export const addItemToCart = async (obj) => {
  try {
    const response = await fetch('/api/addToCart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( obj ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const addManyItemsToCart = async (obj) => {
  try {
    const response = await fetch('/api/orderItem/addManyToCart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( obj ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const removeItemfromCart = async (itemId) => {
  try {
    const response = await fetch('/api/removeItemFromCart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( itemId ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const disconnectItemfromCart = async (obj) => {
  try {
    const response = await fetch('/api/disconnectItemsfromCart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( obj ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const publishCart = async (cartId) => {
  try {
    const response = await fetch('/api/publishCart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( cartId ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const publishItemAddedToCart = async (itemId) => {
  try {
    const response = await fetch('/api/publishCartItem', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( itemId ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const publishManyItemsAddedToCart = async (orderItemsIds) => {
  try {
    const response = await fetch('/api/orderItem/publishMany', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( orderItemsIds ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const publishManyVariants = async (orderItemId) => {
  try {
    const response = await fetch('/api/orderItem/publishManyVariants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( orderItemId ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getCollections = async (cursor, searchText, isAdmin) => {//TODO: FINISH
  const querySearchtext = searchText ? searchText : ""; 
  const getPublished = !isAdmin ? ", state_not: Removed, products_some: {state: Available}" : "";
  const query = gql`
    query MyQuery($querySearchtext: String) {
      collectionsConnection( where: {_search: $querySearchtext${getPublished}}, orderBy: createdAt_DESC) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            id
            name
            slug
            stage
            state
            description
            imageUrl
            price
            products(first: 4) {
              id
              excerpt
              imageUrls(first: 1) {
                url
              }
              name
              rating
            }
          }
        }
      }
    }
  `;
  const result = await request(graphqlPublicAPI, query, { cursor, querySearchtext });
  return {
    collections: result.collectionsConnection.edges,
    pageInfo: {
      ...result.collectionsConnection.pageInfo
    },
  };
};
export const getCollectionDetails = async (collectionId) => {//TODO: get similar products? using categories OR collections
  const query = gql`
    query GetCollectionDetails($collectionId : ID!) {
      collection(where: {id: $collectionId}) {
        id
        description
        name
        state
        slug
        price
        imageUrl
        reviews{
          id
          headline
          rating
          content
          theUser {
            id
            firstName
            lastName
            profileImageUrl
          }
        }
        products {
          id
          name
          excerpt
          description
          price
          rating
          state
          reviews{
            id
            headline
            rating
            content
            theUser {
              id
              firstName
              lastName
              profileImageUrl
            }
          }
          productVariants {
            id
            name
            quantity
          }
          imageUrls {
            id
            url
          }
        }
      }
    }
  `;

  const result = await request(graphqlAPI, query, { collectionId });
  console.log("result: \n", result);
  console.log("Hello World!!!!!!!\n\n\n\n");
  return result.collection;
};
export const reviewCollection = async (reviewDetails) => {
  try {
    const response = await fetch('/api/review/reviewCollection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( reviewDetails ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const publishCollection = async (collectionId) => {
  try {
    const response = await fetch('/api/publishCollection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( collectionId ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export const deleteCollection = async (collectionId) => {
  try {
    const response = await fetch('/api/deleteCollection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( collectionId ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export const createCollection = async (collectionDetails) => {
  try {
    const response = await fetch('/api/createCollection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( collectionDetails ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export const updateCollection = async (collectionDetails) => {
  try {
    const response = await fetch('/api/updateCollection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( collectionDetails ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
export const updateCollectionState = async (collectionDetails) => {
  try {
    const response = await fetch('/api/updateCollectionState', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( collectionDetails ),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}