# Online Food Delivery System

## Introduction
A virtual food delivery website using Node js, Express and Mongoose.

## Run
Before running this application you have to install all the dependencies by running the following command.
> npm install

## Technology 
The application is built with:
- Node.js version 16.15.0
- MongoDB 
- Express 

## Features
The application displays virtual food store that contains food and other informations

Admin can do the following:
- Login to the admin pannel.
- They can view/add/edit/delete the restaurant.
- They can view/delete the restaurant admin.

Restaurant admins can do the following:
- Create an account and login.
- They can view/add/edit/delete food to/from the restaurant.
- They can send request to the delivery partner.
- They can view the accepted and rejected delivery requests.

Customer can do the following:
- Create an account and login.
- Search for restaurant based on location, food and ingredients.
- Create/view/cancel order.
- Rate restaurant.
- Rate food.

Delivery partner can do the following:
- Accept order delivery.
- Reject order delivery.
- Update order delivery status.

## Database
All the models can be found in models folder of each microservices created using mongoose.

