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
        unverified,
        verified
    }
    
    enum TollStates {
        unauthorised,
        authorised
    }
    
    struct FormDataType {
        address ethAddress;
        bytes32 formdataHash;
        FormStates status;
    }
    
    enum FormStates {
        submitted,
        inReview,
        onHold,
        approved,
        rejected
    }
    
    mapping(address => bool) public userExists;
    mapping(address => bool) public tollExists;
    
    mapping(address=>UserInformationType) public userInformation;
    mapping(address=>TollInformationType) public tollInformation;
    
    mapping(bytes32 => FormDataType) private submittedForms;
    
    mapping(address => bytes32) private ethAddressToUuidHash; 
    
    //check what is oracle
    
    event UserStatusUpdated(address ethAddress, UserStates status);
    event TollStatusUpdated(address ethAddress,TollStates status);
    
    event NewUserAccount(bytes32 uuidHash, address indexed ethAddress, bytes32 accountdataHash);
    event NewTollAccount(bytes32 uuidHash, address indexed ethAddress, bytes32 accountdataHash);
    
    event UserFormApproved(bytes32 uuidHash, address indexed ethAddress);
    event UserFormRejected(bytes32 uuidHash, address indexed ethAddress);
    
    event TollFormApproved(bytes32 uuidHash, address indexed ethAddress);
    event TollFormRejected(bytes32 uuidHash, address indexed ethAddress);
    
    address public assetContract;
    
    constructor(address _assetContract) public {
        require(_assetContract != address(0));
        assetContract = _assetContract;
    }
    
    modifier onlyExistingUser(address ethAddress) {
        if(userExists[ethAddress] == false){
            revert('User does not exist.');
        }
        else if (userExists[ethAddress] && (userInformation[ethAddress].status != UserStates.verified)){
            revert('User exists but not verified');
        }
        _;
    }
    modifier onlyExistingToll(address ethAddress) {
        if(tollExists[ethAddress] == false){
            revert('Toll does not exist.');
        }
        else if (tollExists[ethAddress] && (tollInformation[ethAddress].status != TollStates.authorised)){
            revert('toll exists but not authorised');
        }
        _;
    }
    
    modifier onlyNewUser(address ethAddress) {
        if (userExists[ethAddress] || userInformation[ethAddress].status != UserStates.unverified)
            revert('User exists.');
        _;
    }
    modifier onlyNewToll(address ethAddress) {
        if (tollExists[ethAddress] || tollInformation[ethAddress].status != TollStates.unauthorised)
            revert('User exists.');
        _;
    }
    
    
    function getFormStatus(bytes32 uuidHash) public view returns (int8 status) {
        FormDataType memory fd = submittedForms[uuidHash];
        if (fd.ethAddress == address(0))
            return -1;
        else
            return int8(fd.status);
    }
    function getFormStateIdentifierByCode(int8 statusCode)
    public pure returns(string memory statusIdentifier) {
        require(statusCode <= 4);
        if (statusCode < 0)
            return "notSubmittedOnContract";
        if (statusCode == int8(FormStates.submitted)) return "submitted";
        if (statusCode == int8(FormStates.inReview)) return "inReview";
        if (statusCode == int8(FormStates.onHold)) return "onHold";
        if (statusCode == int8(FormStates.approved)) return "approved";
        if (statusCode == int8(FormStates.rejected)) return "rejected";
    }

    function getFormStatusCodeByIdentifier(string memory statusIdentifier)
    public pure returns(int8 statusCode) {
        bytes32 identifierHash = keccak256(bytes(statusIdentifier));
        if (identifierHash == keccak256("notSubmittedOnContract")) return -1;
        if (identifierHash == keccak256("submitted")) return int8(FormStates.submitted);
        if (identifierHash == keccak256("inReview")) return int8(FormStates.inReview);
        if (identifierHash == keccak256("onHold")) return int8(FormStates.onHold);
        if (identifierHash == keccak256("approved")) return int8(FormStates.approved);
        if (identifierHash == keccak256("rejected")) return int8(FormStates.rejected);
    }
    
    function addUserByEmail(address ethAddress, bytes32 emailHash, bytes32 userInfoHash)
    public
    onlyNewUser(ethAddress)
    {
        userExists[ethAddress] = true;
        userInformation[ethAddress] = UserInformationType(emailHash, userInfoHash, UserStates.verified);
        emit UserStatusUpdated(ethAddress, UserStates.verified);

    }
    
    function submitUserFormData(bytes32 uuidHash, address ethAddress, bytes32 formdataHash)
    public
    onlyExistingUser(ethAddress) {
        submittedForms[uuidHash] = FormDataType(ethAddress, formdataHash, FormStates.submitted);
        ethAddressToUuidHash[ethAddress] = uuidHash;
        emit NewUserAccount(uuidHash, ethAddress, formdataHash);
    }
    
    function approveUserForm(bytes32 uuidHash)
    public
    onlyOwner {
        submittedForms[uuidHash].status = FormStates.approved;
        address u_addr = submittedForms[uuidHash].ethAddress;
        emit UserFormApproved(uuidHash, u_addr);
    }
    
    function rejectUserForm(bytes32 uuidHash)
    public
    onlyOwner {
        submittedForms[uuidHash].status = FormStates.rejected;
        address u_addr = submittedForms[uuidHash].ethAddress;
        emit UserFormRejected(uuidHash, u_addr);
    }
    
    function revokeUser(address ethAddress)
    public
    onlyExistingUser(ethAddress)
    {
        userExists[ethAddress] = false;
        emit UserStatusUpdated(ethAddress, UserStates.unverified);
    }
    
    function payTollTax(address from, address to, uint256 amount)
    public
    onlyExistingUser(from)
    {
        require(submittedForms[ethAddressToUuidHash[from]].status == FormStates.approved, "User account not approved");
        require(submittedForms[ethAddressToUuidHash[to]].status == FormStates.approved, "Toll account not approved");
        
        ERC20Mintable erc = ERC20Mintable(assetContract);
        bool success = erc.transferFrom(from, to, amount);
        require(success, 'Transaction Failed');

    }
    
    
    
    
    function addTollByEmail(address ethAddress, bytes32 emailHash, bytes32 tollInfoHash)
    public
    onlyNewToll(ethAddress)
    {
        tollExists[ethAddress] = true;
        tollInformation[ethAddress] = TollInformationType(emailHash, tollInfoHash,  TollStates.authorised);
        emit TollStatusUpdated(ethAddress, TollStates.authorised);

    }
    function submitTollFormData(bytes32 uuidHash, address ethAddress, bytes32 formdataHash)
    public
    onlyExistingToll(ethAddress) {
        submittedForms[uuidHash] = FormDataType(ethAddress, formdataHash, FormStates.submitted);
        ethAddressToUuidHash[ethAddress] = uuidHash;
        emit NewTollAccount(uuidHash, ethAddress, formdataHash);
    }
    
    function approveTollForm(bytes32 uuidHash)
    public
    onlyOwner {
        submittedForms[uuidHash].status = FormStates.approved;
        address u_addr = submittedForms[uuidHash].ethAddress;
        emit TollFormApproved(uuidHash, u_addr);
    }
    function rejectTollForm(bytes32 uuidHash)
    public
    onlyOwner {
        submittedForms[uuidHash].status = FormStates.rejected;
        address u_addr = submittedForms[uuidHash].ethAddress;
        emit TollFormRejected(uuidHash, u_addr);
    }
    function revokeToll(address ethAddress)
    public
    onlyExistingToll(ethAddress)
    {
        tollExists[ethAddress] = false;
        emit TollStatusUpdated(ethAddress, TollStates.unauthorised);
    }
    
    
}
