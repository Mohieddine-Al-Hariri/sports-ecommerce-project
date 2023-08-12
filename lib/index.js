import { request, gql } from 'graphql-request';
const graphqlAPI = process.env.GRAPHYL_ENDPOINT;

export const getTheUser = async ( slug ) => {
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
        orderItems {
          product {
            slug
            price
            id
            images {
              url
              size
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
  console.log("Update The User");
  console.log("updatedDetails in index: ", updatedDetails);
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

export const getProducts = async (cursor, searchText, category, isAdmin) => {
  //TODO: Add rating for each product and comments
  //TODO: add pagination using cursor
  const querySearchtext = searchText ? searchText : ""; 
  // const getPublished = !isAdmin ? ", isPublished: true" : "";
  // const categoryQuery = category ? `, categories_every: {name: $category}` : "";
  const getPublished =  "";
  const categoryQuery = "";

  const query = gql`
  query MyQuery($querySearchtext: String, $cursor: String${category ? `, $category: String` : ""}) {
    productsConnection(first: 10, after: $cursor, where: {_search: $querySearchtext${getPublished}${categoryQuery}}, orderBy: createdAt_DESC) {
        edges {
          cursor
          node {
            collections {
              name
              slug
            }
            id 
            excerpt
            images {
              url
            }
            name
            price
            slug
          }
        }
        pageInfo {
          hasNextPage
        }
      }
    }
  `;
  const result = await request(graphqlAPI, query, { cursor, querySearchtext, category });
  return {
    products: result.productsConnection.edges,
    pageInfo: {
      ...result.productsConnection.pageInfo
    },
  };
};
export const getCartItems = async (cursor, searchText, userId, isAdmin) => {
  //TODO: add pagination using cursor?
  const querySearchtext = searchText ? searchText : ""; 
  // const getPublished = !isAdmin ? ", isPublished: true" : "";
  // const getPublished =  "";
  console.log(cursor, searchText, userId)
  const query = gql`
    query MyQuery ($querySearchtext: String, ${cursor  ? "$cursor: String, " : ""} $userId: ID){
      orderItemsConnection(
        first: 10
        orderBy: createdAt_DESC
        where: {theUser: {id: $userId}, _search: $querySearchtext}
      ) {
        pageInfo {
          hasNextPage
        }
        edges {
          cursor
          node {
            createdAt
            quantity
            total
            product {
              images {
                url
              }
              excerpt
              id
              name
              price
              slug
              variants {
                ... on ProductSizeColorVariant {
                  id
                  name
                }
              }
            }
            id
          }
        }
      }
    }
  `;
  const result = await request(graphqlAPI, query, { cursor, querySearchtext, userId });
  // console.log("result: ", result);
  return {
    products: result.orderItemsConnection.edges,
    pageInfo: {
      ...result.orderItemsConnection.pageInfo
    },
  };
};
export const getOrders = async (cursor, searchText, userId, isAdmin) => {
  //TODO: add tracking functionality
  //TODO: add pagination using cursor?
  const querySearchtext = searchText ? searchText : ""; 
  // const getPublished = !isAdmin ? ", isPublished: true" : "";
  // const getPublished =  "";
  console.log(cursor, searchText, userId)
  const query = gql`
  query Orders(${cursor ? `$cursor: String, ` : ""}$querySearchtext: String, $userId: ID) {
    ordersConnection(first: 10, where: {theUser: {id: $userId}, _search: $querySearchtext}, orderBy: createdAt_DESC) {
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
              imageUrl
              images {
                url
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
  console.log("result: ", result);
  return {
    orders: result.ordersConnection.edges,
    pageInfo: {
      ...result.ordersConnection.pageInfo
    },
  };
};
export const getAdminOrders = async (cursor, searchText) => {
  //TODO: add tracking functionality...
  //TODO: add pagination using cursor?
  const querySearchtext = searchText ? searchText : ""; 
  console.log(cursor, searchText)
  const query = gql`
    query Orders(${cursor ? `$cursor: String, ` : ""}$querySearchtext: String) {
      ordersConnection(first: 10, where: {_search: $querySearchtext}, orderBy: createdAt_DESC) {
        edges {
          cursor
          node {
            id
            createdAt
            total
            theUser{
              id
              slug
              firstName
              lastName
              email
              location {
                latitude
              }
            }
            orderItems(first: 3) {
              id
              quantity
              total
              product {
                imageUrl
                images {
                  url
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
  const result = await request(graphqlAPI, query, { cursor, querySearchtext });
  console.log("result: ", result);
  return {
    orders: result.ordersConnection.edges,
    pageInfo: {
      ...result.ordersConnection.pageInfo
    },
  };
};

export const getProductDetails = async (productId) => { //TODO: Get using Slug if possible
  const query = gql`
    query GetProductDetails($productId : ID!) {
      product(where: {id: $productId}) {
        id
        name
        price
        publishedBy {
          name
          id
          picture
        }
        images {
          url
        }
        slug
        updatedAt
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
        collections {
          slug
          name
          products(first: 3) {
            images {
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
  // console.log("result: ", result);
  return result.product;
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
export const publishSubmittedOrder = async (submittedOrderId) => {
  try {
    const response = await fetch('/api/publishOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( submittedOrderId ),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
export const addItemToCart = async (itemId) => {
  try {
    const response = await fetch('/api/addToCart', {
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

//TODO: Make the cart 2 way reference with user??

export const deletePost = async (slug) => {
  try {
    const response = await fetch('/api/deletePost', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify( slug ),
    });

    // if (!response.ok) {
    //   console.log("response", response.json())

    //   throw new Error('Failed to submit comment');
    // }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};