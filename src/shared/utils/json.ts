// Add a custom toJSON method to BigInt prototype
BigInt.prototype['toJSON'] = function () {
    return this.toString();
}; 
