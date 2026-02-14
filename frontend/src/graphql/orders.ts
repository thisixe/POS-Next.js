import { gql } from '@apollo/client';

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      orderNumber
      total
      status
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query GetMyOrders {
    myOrders {
      id
      orderNumber
      total
      status
      createdAt
      items {
        name
        price
        quantity
        image
      }
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      id
      orderNumber
      total
      subtotal
      shippingFee
      status
      paymentMethod
      paymentStatus
      shippingAddress {
        name
        phone
        address
        district
        province
        postalCode
      }
      items {
        product {
          name
          slug
        }
        name
        price
        quantity
        image
      }
      createdAt
    }
  }
`;
