// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UpgradeableForwarderV2 is Initializable, OwnableUpgradeable {
    address public immutable target1;
    address public immutable target2;
    address public immutable target3;
    // New variable
    address public immutable target4;

    enum TargetIds {
        Target1,
        Target2,
        Target3,
        // New enum value
        Target4
    }

    struct CallData {
        TargetIds targetId;
        bytes data;
    }

    constructor(address[4] memory _targets) {
        target1 = _targets[0];
        target2 = _targets[1];
        target3 = _targets[2];
        // New assignment
        target4 = _targets[3];
    }

    function __Proxy_init(address _initialOwner) public initializer {
        __Ownable_init(_initialOwner);
    }

    function forward(CallData memory callData) public payable {
        address target = getTarget(callData.targetId);
        require(
            _simulateTargetCall(target, callData.data),
            "UpgradeableForwarder: simulation failed"
        );
    }

    function getTarget(TargetIds targetId) public view returns (address) {
        if (targetId == TargetIds.Target1) {
            return target1;
        } else if (targetId == TargetIds.Target2) {
            return target2;
        } else if (targetId == TargetIds.Target3) {
            return target3;
        }
        // New condition
        else if (targetId == TargetIds.Target4) {
            return target4;
        } else {
            revert("UpgradeableForwarder: invalid targetId");
        }
    }

    function _simulateTargetCall(address, bytes memory) internal pure returns (bool) {
        return true;
    }

    fallback() external payable {}
    receive() external payable {}
}
