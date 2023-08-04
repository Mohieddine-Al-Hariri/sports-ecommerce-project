import NextAuth from "next-auth/next";
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from "next-auth/providers/credentials";
import FacebookProvider from 'next-auth/providers/facebook'
import { v4 as uuidv4 } from 'uuid';
import { GraphQLClient, gql } from "graphql-request";
import { compare, hash } from "bcrypt";

const client = new GraphQLClient(process.env.GRAPHYL_ENDPOINT, {
  headers: {
    Authorization: `Bearer ${process.env.HYGRAPH_MUTATION_TOKEN}`,
  },
});

const GetUserByPhoneNumber = gql`
  query GetUserByPhoneNumber($countroCodePhoneNumber: String!) {
    user: theUsers(where: { countroCodePhoneNumber: $countroCodePhoneNumber }, stage: DRAFT) { 
      id
      password
      slug
      firstName
      lastName
      bio
      darkMode
      email
      profileImageUrl
      userRoles {
        role
      } 
      countroCodePhoneNumber
    }
  }
`;// You can get more field/properties from here

const GetUserByEmail = gql`
  query GetUserByEmail($email: String!) {
    user: theUsers(where: { email: $email }, stage: DRAFT) { 
      id
      firstName
      lastName
      slug
      countryCode
      phoneNumber
      bio
      darkMode
      email
      profileImageUrl
      userRoles {
        role
      }
      countroCodePhoneNumber
    }
  }
`;


const CreateTheUser = gql`
  mutation CreateTheUser($firstName: String!, $lastName: String!, $password: String!, $slug: String!, $countroCodePhoneNumber: String!) {
    newUser: createTheUser(data: { firstName: $firstName, lastName: $lastName,  password: $password, slug: $slug, userRoles: {connect: {id: "clisq7i9a00ij0cuu7khxci5u"}}, darkMode: false, countroCodePhoneNumber: $countroCodePhoneNumber }) {
      id
      slug
      firstName
      lastName
      phoneNumber
      password
      darkMode
      profileImageUrl
      userRoles{
        role
      }
      countroCodePhoneNumber
    }
  }
`;
const publishUser = gql`
  mutation PublishUser($slug: String!) {
    publishTheUser(where: {slug: $slug}) {
      slug
    }
  }
`;

const CreateUserByEmailPass = gql`
  mutation CreateTheUser($email: String!, $photo: String!, $firstName: String!, $lastName: String!, $slug: String!, $profileImageUrl: String! ) {
    newUser: createTheUser(data: { email: $email, photo: {create: {handle: $slug, fileName: $photo } }, firstName: $firstName, lastName: $lastName, profileImageUrl: $profileImageUrl, slug: $slug, userRoles: {connect: {id: "clisq7i9a00ij0cuu7khxci5u"}}, darkMode: false }) {
      id
      slug
      firstName
      lastName
      darkMode
      email
      profileImageUrl
      userRoles{
        role
      }
    }
  }
`;


export const authOptions = {  

  session: {
    strategy : 'jwt',
  },
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      async profile(profile) {
        // console.log("profile: ", profile)
        const { user } = await client.request(GetUserByEmail, { email: profile.email });
        // console.log("\nuser__________\n\n", user);
        if (!user || user?.length === 0) {
          // console.log("profile: ", profile)
          // console.log("---------------------------------------user not found");
          const slug = uuidv4();
          const { newUser } = await client.request(CreateUserByEmailPass, {
            // id: newUser.id,
            slug,
            email: profile.email,
            //password: await hash(user.password, 12),
            photo: profile.picture,
            profileImageUrl: profile.picture,
            firstName: profile.given_name,
            lastName: profile.family_name,
          });
          // console.log("_____newUser: ", newUser)
          return {
            id: newUser.id,
            user: {
              id: newUser.id,
              name: newUser.given_name,
              email: newUser.email,
              slug: newUser.slug,
              profileImageUrl: newUser.profileImageUrl,
              darkMode: false,
              userRole: newUser.userRoles[0].role
            }
          };
        }

        //TODO: Make it more secure??
        // console.log("user[0]: ", user[0])

        
        return {
          name: user[0].firstName,
          id: user[0].id,
          user: {
            id: user[0].id,
            name: user[0].firstName,
            lastName: user[0].lastName,
            email: user[0].email,
            slug: user[0].slug,
            profileImageUrl: user[0].profileImageUrl,
            bio: user[0].bio,
            darkMode: user[0].darkMode,
            countryCode: +user[0].countroCodePhoneNumber?.substring(0, user[0].countroCodePhoneNumber.indexOf('_')),
            phoneNumber: user[0].countroCodePhoneNumber?.slice(user[0].countroCodePhoneNumber.indexOf('_') + 1),
            userRole: user[0].userRoles[0].role,
            countryCodePhoneNumber: user[0].countroCodePhoneNumber
          }
        };
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET
      // clientSecret: process.env.FACEBOOK_CLIENT_TOKEN
    }),
    CredentialsProvider({
      name: 'Phone Number',
      credentials : {
        countryCode: {
          label: 'Country Code',
          type: 'number',
        },
        phoneNumber: {
          label: 'Phone Number',
          type: 'number',
          placeholder: '1112223'
        },
        password: {
          label: 'Password',
          type: 'password'
        },
        firstName: {
          label: 'First Name',
          type: 'text'
        },
        lastName: {
          label: 'Last Name',
          type: 'text'
        },
      },
      authorize: async (credentials, req) => {
        const { phoneNumber, password, countryCode, firstName, lastName, isLogIn, ph } = credentials
        const countryPhoneNumber = ph;
        // const countryPhoneNumber = `${countryCode.slice(1)}_${phoneNumber}`;
        // console.log("credentials: ", credentials)
        const { user } = await client.request(GetUserByPhoneNumber, {
          countroCodePhoneNumber: countryPhoneNumber,
          // countryCode: countryCode.slice(1),
        });
        // console.log("__________________-user: ", user)
        if(isLogIn === 'true' && (user.length === 0 || !user )){
          throw new Error("Account not found! Sign-Up Instead");
        }
        if ( isLogIn === "false" && (!user || user.length === 0)) {
          const slug = uuidv4();
          const hashedPassword = await hash(password, 12)
          const { newUser } = await client.request(
            CreateTheUser,
            {
              // phoneNumber: +phoneNumber,
              password: hashedPassword,
              firstName,
              lastName,
              // countryCode: countryCode.slice(1),
              slug,
              countroCodePhoneNumber: countryPhoneNumber,
            }
          );
          await client.request(publishUser, {slug});
          return {
            id: newUser.id,
            user: {
              id: newUser.id,
              name: firstName,
              lastName,
              countryCode: +newUser.countroCodePhoneNumber.substring(0, newUser.countroCodePhoneNumber.indexOf('_')),
              phoneNumber: newUser.countroCodePhoneNumber.slice(newUser.countroCodePhoneNumber.indexOf('_') + 1), //TODO: Pass Something Else? or make it hidden on preference
              countryCodePhoneNumber: countroCodePhoneNumber,
              slug,
              darkMode: false,
              userRole: newUser.userRoles[0].role,
            }
          };
        }
        // console.log("---------------------------------------user found: ", user);
        // console.log("---------------------------------------user.password: ", user[0].password);
        const isValid = await compare(password, user[0].password);
      
        if (!isValid) {
          throw new Error("Wrong credentials. Try again.");
        }
        const { id, slug, userRoles, bio, darkMode, countroCodePhoneNumber, profileImageUrl } = user[0];
        // console.log("sec")
        return {
          user: {
            id,
            name: user[0].firstName,
            lastName: user[0].lastName,
            countryCode: +countroCodePhoneNumber.substring(0, countroCodePhoneNumber.indexOf('_')),
            phoneNumber: +countroCodePhoneNumber.slice(countroCodePhoneNumber.indexOf('_') + 1),
            slug,
            userRole: userRoles[0].role,
            bio,
            darkMode,
            countryCodePhoneNumber: countroCodePhoneNumber,
            profileImageUrl
          }
        }
        
      },
    }),
  ],
  //TODO:
  // jwt: {
  //   encode: ({ secret, token }) => {
  //     const encodedToken = jsonwebtoken.sign(
  //       {
  //         ...token,
  //         iss: "grafbase",
  //         exp: Math.floor(Date.now() / 1000) + 60 * 60,
  //       },
  //       secret
  //     );
      
  //     return encodedToken;
  //   },
  //   decode: async ({ secret, token }) => {
  //     const decodedToken = jsonwebtoken.verify(token, secret);
  //     return decodedToken;
  //   },
  // },

  callbacks: {
    async jwt({token, user, trigger, session}) {
      // console.log("token in jwt: ", token, user)
      if(trigger === "update"){
        // console.log("triggered", session)
        token.user = session?.user
        return token
      }
      return { ...token, ...user }
    },
    async session({session, token}) {
      // console.log("session in session: ", session)
      // console.log(token)
      session.user = token.user;
      return session
    },

  },
  pages: {
    signIn: "/SignIn",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
export default NextAuth(authOptions)
  
  