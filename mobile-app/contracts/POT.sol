// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract POT is ReentrancyGuard {
    using SafeERC20 for IERC20;
    uint256 public contractActivatedTime;
    uint256 public timeToRaiseDispute;
    address public passenger;
    address public driver;
    address public arbitrator;
    address public tokenAddress;
    IERC20 public token;
    uint256 public amountPayable;
    uint256 public arbitrationFee;
    bool public activatedByDriver = false;
    bool public activatedByPassenger = false;
    bool public contractActivated = false;
    bool public dispute_raised = false;
    bool public contractSettled = false;
    bool public deliveryByPassenger = false;
    bool public deliveryByDriver = false;
    bool public deliveryByApp = false;
    bool isTripFinished = false;

    enum State {
        AWAITING_PAYMENT,
        AWAITING_DELIVERY,
        COMPLETE
    }

    State public currState;

    modifier onlyDriver() {
        require(msg.sender == driver, "Only driver can call this method");
        _;
    }

    modifier onlyPassenger() {
        require(msg.sender == passenger, "Only passenger can call this method");
        _;
    }

    modifier onlyArbitrator() {
        require(
            msg.sender == arbitrator,
            "Only arbitrator can call this method"
        );
        _;
    }

    constructor(
        address _arbitrator,
        address _passenger,
        uint256 _amountPayable,
        uint256 _arbitrationFee,
        address _tokenAddress
    ) {
        arbitrator = _arbitrator;
        passenger = _passenger;
        amountPayable = _amountPayable;
        arbitrationFee = _arbitrationFee;
        tokenAddress = _tokenAddress;
        token = IERC20(_tokenAddress);
    }

    function paymentByPassenger(uint256 totalAmount) public onlyPassenger {
        // Comprobar si el contrato no ha sido activado
        require(!contractActivated, "Contract already activated");
        // Comprobar si no se activó el contrato por pasarajero
        require(
            !activatedByPassenger,
            "Contract already activated by passenger"
        );
        require(
            totalAmount == amountPayable + arbitrationFee,
            "Invalid amount"
        );
        // Comprobar si se ha enviado una cantidad suficiente de tokens ERC20
        token.transferFrom(
            msg.sender,
            address(this),
            amountPayable + arbitrationFee
        );

        // Si se ha enviado una cantidad mayor de tokens ERC20, devolver la cantidad sobrante
        // if (token.balanceOf(address(this)) > amountPayable + arbitrationFee) {
        //     uint256 amount_to_return = token.balanceOf(address(this)) -
        //         (amountPayable + arbitrationFee);
        //     token.transfer(msg.sender, amount_to_return);
        // }

        activatedByPassenger = true;
    }

    //called by driver if start the travel
    function startRideByDriver(address _driver) external {
        driver = _driver;
        require(
            currState == State.AWAITING_PAYMENT && activatedByPassenger,
            "Already paid"
        );
        currState = State.AWAITING_DELIVERY;
        contractActivated = true;
        activatedByDriver = true;
        contractActivatedTime = block.timestamp; //block.timestamp
    }

    //called by passenger if transaction occured successfully
    function confirmDeliveryByPassenger() public onlyPassenger {
        require(
            currState == State.AWAITING_DELIVERY && activatedByDriver,
            "Delivery not confirmed by driver yet"
        );
        require(!deliveryByPassenger, "Already confirmed delivery");
        deliveryByPassenger = true;
        contractSettled = true;
        currState = State.COMPLETE;
        finishTrip();
    }

    //called by driver if transaction occured successfully
    function confirmDeliveryByDriver() public onlyDriver {
        require(
            currState == State.AWAITING_DELIVERY && activatedByDriver,
            "Cannot confirm delivery"
        );
        deliveryByDriver = true;
        if (deliveryByApp) {
            currState = State.COMPLETE;
        }
        finishTrip();
    }

    //called by app for gps location boolena if transaction occured successfully
    function confirmDeliveryByApp() public onlyArbitrator {
        require(
            currState == State.AWAITING_DELIVERY,
            "Cannot confirm delivery"
        );
        deliveryByApp = true;
        contractSettled = true;
        if (deliveryByDriver) {
            currState = State.COMPLETE;
        }
        finishTrip();
    }

    //function intern called by contract for match gps location and confirm by driver
    function finishTrip() internal {
        require(
            !isTripFinished && activatedByPassenger,
            "Trip already finished"
        );
        if (currState == State.COMPLETE && deliveryByPassenger) {
            token.transfer(driver, amountPayable);
            token.transfer(arbitrator, arbitrationFee);
            isTripFinished = true;
        }
        if (currState == State.COMPLETE && deliveryByDriver && deliveryByApp) {
            token.transfer(driver, amountPayable);
            token.transfer(arbitrator, arbitrationFee);
            isTripFinished = true;
        }
    }

    //called by anyone(generally driver if timeToRaiseDispute is passed
    function forceSettle() public {
        require(block.timestamp > (timeToRaiseDispute + contractActivatedTime));
        payable(passenger).transfer(arbitrationFee);
        uint256 amountPayable_to_driver = arbitrationFee + amountPayable;
        payable(driver).transfer(amountPayable_to_driver);
        contractSettled = true;
    }

    //withdraw money if other party is taking too much time or any other reason
    function withdrawByPassenger() public onlyArbitrator {
        require(activatedByPassenger);
        activatedByPassenger = false;
        uint256 totalAmount = amountPayable + arbitrationFee;
        token.transfer(passenger, totalAmount);
    }

    function payToDriver() public onlyArbitrator {
        require(dispute_raised == true);
        token.transfer(arbitrator, arbitrationFee);
        token.transfer(driver, amountPayable);
        contractSettled = true;
    }
}
