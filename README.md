# Address Book Server
### Base URL: https://address-book-server-neon.vercel.app

* JWT implementation : /jwt
* Get all address with Pagination: /getaddressdata?page=1&size=6
* Phase matching results by name: /addressdata?name=B
* Get single address by id: /getaddress/:id
* Add a single address: /addaddress
* Update a single address by id: /updateaddress/:id
* Delete single address by id: /deleteaddress/:id
* Bulk operation add multiple data: /addressbulk


Use Technology:
Node.js, Express.js, MongoDB, JWT, dotenv, cors