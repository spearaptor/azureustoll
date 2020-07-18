pragma solidity >=0.5.1 <0.7.0;
pragma experimental ABIEncoderV2;
import "./ERC20Mintable.sol";

contract Ownable {
    address public owner;

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }
}

contract TollTax is Ownable{
    
    struct UserInformationType {
        bytes32 emailHash;
        bytes32 userInfoHash;
        UserStates status;
    }
    
    struct TollInformationType {
        bytes32 emailHash;
        bytes32 tollInfoHash;
        TollStates status;
    }
    
    enum UserStates {
        notApplied,
        pending,
        verified,
        rejected
    }
    
    enum TollStates {
        notApplied,
        pending,
        authorised,
        rejected
    }
    
    
    mapping(address => bool) public userExists;
    mapping(address => bool) public tollExists;
    
    mapping(address=>UserInformationType) public userInformation;
    mapping(address=>TollInformationType) public tollInformation;
    
    // mapping(bytes32 => FormDataType) private submittedForms;
    
    // mapping(address => bytes32) private ethAddressToUuidHash; 
    
    //check what is oracle
    
    event UserStatusUpdated(address ethAddress, UserStates status);
    event TollStatusUpdated(address ethAddress,TollStates status);
    
    event TransferSuccess(address from, address to, uint256 amount);
    event TransferFaliure(address from, address to, uint256 amount);
    
    // event NewUserAccount(bytes32 uuidHash, address indexed ethAddress, bytes32 accountdataHash);
    // event NewTollAccount(bytes32 uuidHash, address indexed ethAddress, bytes32 accountdataHash);
    
    // event UserFormApproved(bytes32 uuidHash, address indexed ethAddress);
    // event UserFormRejected(bytes32 uuidHash, address indexed ethAddress);
    
    // event TollFormApproved(bytes32 uuidHash, address indexed ethAddress);
    // event TollFormRejected(bytes32 uuidHash, address indexed ethAddress);
    
    address public assetContract;
    
    constructor(address _assetContract) public {
        require(_assetContract != address(0));
        assetContract = _assetContract;
    }
    
    modifier onlyFullyApprovedUser(address ethAddress) {
        if(userExists[ethAddress] == false){
            revert('User does not exist.');
        }
        else if (userExists[ethAddress] && (userInformation[ethAddress].status != UserStates.verified)){
            revert('User exists but not verified');
        }
        _;
    }
    modifier onlyFullyApprovedToll(address ethAddress) {
        if(tollExists[ethAddress] == false){
            revert('Toll does not exist.');
        }
        else if (tollExists[ethAddress] && (tollInformation[ethAddress].status != TollStates.authorised)){
            revert('toll exists but not authorised');
        }
        _;
    }
    
    modifier onlyPartiallyApprovedUser(address ethAddress){
        if(userExists[ethAddress] == false){
            revert('User does not exist.');
        }
        _;
    }
    
    modifier onlyPartiallyApprovedToll(address ethAddress){
        if(tollExists[ethAddress] == false){
            revert('Toll does not exist.');
        }
        _;
    }
    
    modifier onlyNewUser(address ethAddress) {
        if (userExists[ethAddress] || userInformation[ethAddress].status == UserStates.verified)
            revert('User account exists.');
        _;
    }
    modifier onlyNewToll(address ethAddress) {
        if (tollExists[ethAddress] || tollInformation[ethAddress].status == TollStates.authorised)
            revert('Toll account exists.');
        _;
    }
    
    
    function getUserStatus(address ethAddress) public view returns (int8 status) {
        if (ethAddress == address(0))
            return -1;
        else
            return int8(userInformation[ethAddress].status);
    }
    
    function addUserByEmail(address ethAddress, bytes32 emailHash, bytes32 userInfoHash)
    public
    onlyNewUser(ethAddress)
    {
        userExists[ethAddress] = true;
        userInformation[ethAddress] = UserInformationType(emailHash, userInfoHash, UserStates.pending);
        emit UserStatusUpdated(ethAddress, UserStates.pending);
    }
    
    function approveUser(address ethAddress)
    public
    onlyOwner {
        userInformation[ethAddress].status = UserStates.verified;
        emit UserStatusUpdated(ethAddress, UserStates.verified);
    }
    
    function rejectUser(address ethAddress)
    public
    onlyOwner {
        userInformation[ethAddress].status = UserStates.rejected;
        emit UserStatusUpdated(ethAddress, UserStates.rejected);
    }
    
    function revokeUser(address ethAddress)
    public
    onlyPartiallyApprovedUser(ethAddress)
    {
        userExists[ethAddress] = false;
        userInformation[ethAddress].status = UserStates.notApplied;
        emit UserStatusUpdated(ethAddress, UserStates.notApplied);
    }
    
    function payTollTax(address from, address to, uint256 amount)
    public
    onlyFullyApprovedUser(from)
    onlyFullyApprovedToll(to)
    {
        ERC20Mintable erc = ERC20Mintable(assetContract);
        bool success = erc.transferFrom(from, to, amount);
        if(success){
            emit TransferSuccess(from, to, amount);
        }
        else{
            emit TransferFaliure(from, to, amount);
        }

    }
    
    
    //TOLL PART
    
    
    function getTollStatus(address ethAddress) public view returns (int8 status) {
        if (ethAddress == address(0))
            return -1;
        else
            return int8(tollInformation[ethAddress].status);
    }
    
    function addTollByEmail(address ethAddress, bytes32 emailHash, bytes32 tollInfoHash)
    public
    onlyNewToll(ethAddress)
    {
        tollExists[ethAddress] = true;
        tollInformation[ethAddress] = TollInformationType(emailHash, tollInfoHash,  TollStates.pending);
        emit TollStatusUpdated(ethAddress, TollStates.pending);
    }
    
    function approveToll(address ethAddress)
    public
    onlyOwner {
        tollInformation[ethAddress].status = TollStates.authorised;
        emit TollStatusUpdated(ethAddress, TollStates.authorised);
    }
    
    function rejectToll(address ethAddress)
    public
    onlyOwner {
        tollInformation[ethAddress].status = TollStates.rejected;
        emit TollStatusUpdated(ethAddress, TollStates.rejected);
    }
    
    function revokeToll(address ethAddress)
    public
    onlyPartiallyApprovedToll(ethAddress)
    {
        tollExists[ethAddress] = false;
        tollInformation[ethAddress].status = TollStates.notApplied;
        emit TollStatusUpdated(ethAddress, TollStates.notApplied);
    }
    
    
}
