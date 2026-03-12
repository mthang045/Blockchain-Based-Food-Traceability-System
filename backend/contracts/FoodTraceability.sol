// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title FoodTraceability
 * @dev Smart Contract for Food Supply Chain Traceability System
 * @author Blockchain_Nhom13
 */
contract FoodTraceability {
    
    // Struct to store product information
    struct Product {
        string name;
        string origin;
        string ipfsHash;
        address manufacturer;
        uint256 timestamp;
        bool exists;
    }
    
    // Struct for product status history
    struct StatusHistory {
        string status;
        address updatedBy;
        uint256 timestamp;
        string location;
    }
    
    // Mapping from productId to Product
    mapping(string => Product) private products;
    
    // Mapping from productId to status history
    mapping(string => StatusHistory[]) private productHistory;
    
    // Mapping to track manufacturers
    mapping(address => bool) public isManufacturer;
    
    // Total products registered
    uint256 public totalProducts;
    
    // Events
    event ProductRegistered(
        address indexed manufacturer,
        string name,
        string origin,
        string ipfsHash,
        uint256 timestamp
    );
    
    event ProductStatusUpdated(
        string indexed productId,
        string status,
        address indexed updatedBy,
        string location,
        uint256 timestamp
    );
    
    event ManufacturerAdded(
        address indexed manufacturer,
        uint256 timestamp
    );
    
    // Modifiers
    modifier onlyManufacturer() {
        require(isManufacturer[msg.sender], "Not authorized: Only manufacturers can call this");
        _;
    }
    
    modifier productExists(string memory productId) {
        require(products[productId].exists, "Product does not exist");
        _;
    }
    
    modifier productNotExists(string memory productId) {
        require(!products[productId].exists, "Product already exists");
        _;
    }
    
    // Constructor
    constructor() {
        // Add contract deployer as first manufacturer
        isManufacturer[msg.sender] = true;
        emit ManufacturerAdded(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Add a new manufacturer
     * @param manufacturer Address of the manufacturer
     */
    function addManufacturer(address manufacturer) public {
        require(manufacturer != address(0), "Invalid address");
        require(!isManufacturer[manufacturer], "Already a manufacturer");
        
        isManufacturer[manufacturer] = true;
        emit ManufacturerAdded(manufacturer, block.timestamp);
    }
    
    /**
     * @dev Register a new product on the blockchain
     * @param name Product name
     * @param origin Product origin/location
     * @param ipfsHash IPFS hash or unique product identifier
     * @return success True if registration is successful
     */
    function registerProduct(
        string memory name,
        string memory origin,
        string memory ipfsHash
    ) public returns (bool success) {
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(origin).length > 0, "Origin cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(!products[ipfsHash].exists, "Product already registered");
        
        // Create new product
        products[ipfsHash] = Product({
            name: name,
            origin: origin,
            ipfsHash: ipfsHash,
            manufacturer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });
        
        // Add initial status
        productHistory[ipfsHash].push(StatusHistory({
            status: "MANUFACTURED",
            updatedBy: msg.sender,
            timestamp: block.timestamp,
            location: origin
        }));
        
        totalProducts++;
        
        emit ProductRegistered(
            msg.sender,
            name,
            origin,
            ipfsHash,
            block.timestamp
        );
        
        return true;
    }
    
    /**
     * @dev Update product status
     * @param productId Product ID (IPFS hash)
     * @param status New status
     * @param location Current location
     * @return success True if update is successful
     */
    function updateProductStatus(
        string memory productId,
        string memory status,
        string memory location
    ) public productExists(productId) returns (bool success) {
        require(bytes(status).length > 0, "Status cannot be empty");
        require(bytes(location).length > 0, "Location cannot be empty");
        
        // Add status to history
        productHistory[productId].push(StatusHistory({
            status: status,
            updatedBy: msg.sender,
            timestamp: block.timestamp,
            location: location
        }));
        
        emit ProductStatusUpdated(
            productId,
            status,
            msg.sender,
            location,
            block.timestamp
        );
        
        return true;
    }
    
    /**
     * @dev Get product information
     * @param productId Product ID
     * @return name Product name
     * @return origin Product origin
     * @return ipfsHash IPFS hash
     * @return manufacturer Manufacturer address
     * @return timestamp Registration timestamp
     */
    function getProduct(string memory productId) 
        public 
        view 
        productExists(productId)
        returns (
            string memory name,
            string memory origin,
            string memory ipfsHash,
            address manufacturer,
            uint256 timestamp
        ) 
    {
        Product memory p = products[productId];
        return (p.name, p.origin, p.ipfsHash, p.manufacturer, p.timestamp);
    }
    
    /**
     * @dev Verify if product exists
     * @param productId Product ID
     * @return exists True if product exists
     */
    function verifyProduct(string memory productId) 
        public 
        view 
        returns (bool exists) 
    {
        return products[productId].exists;
    }
    
    /**
     * @dev Get product status history
     * @param productId Product ID
     * @return statuses Array of status strings
     * @return updaters Array of updater addresses
     * @return timestamps Array of timestamps
     * @return locations Array of locations
     */
    function getProductHistory(string memory productId)
        public
        view
        productExists(productId)
        returns (
            string[] memory statuses,
            address[] memory updaters,
            uint256[] memory timestamps,
            string[] memory locations
        )
    {
        uint256 length = productHistory[productId].length;
        
        statuses = new string[](length);
        updaters = new address[](length);
        timestamps = new uint256[](length);
        locations = new string[](length);
        
        for (uint256 i = 0; i < length; i++) {
            StatusHistory memory history = productHistory[productId][i];
            statuses[i] = history.status;
            updaters[i] = history.updatedBy;
            timestamps[i] = history.timestamp;
            locations[i] = history.location;
        }
        
        return (statuses, updaters, timestamps, locations);
    }
    
    /**
     * @dev Get product status history count
     * @param productId Product ID
     * @return count Number of status updates
     */
    function getProductHistoryCount(string memory productId)
        public
        view
        returns (uint256 count)
    {
        return productHistory[productId].length;
    }
    
    /**
     * @dev Get latest product status
     * @param productId Product ID
     * @return status Latest status
     * @return updatedBy Address who updated
     * @return timestamp Update timestamp
     * @return location Current location
     */
    function getLatestProductStatus(string memory productId)
        public
        view
        productExists(productId)
        returns (
            string memory status,
            address updatedBy,
            uint256 timestamp,
            string memory location
        )
    {
        require(productHistory[productId].length > 0, "No history available");
        
        StatusHistory memory latest = productHistory[productId][productHistory[productId].length - 1];
        return (latest.status, latest.updatedBy, latest.timestamp, latest.location);
    }
}
