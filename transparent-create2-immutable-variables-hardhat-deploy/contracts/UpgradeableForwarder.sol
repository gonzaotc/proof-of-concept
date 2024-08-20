// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UpgradeableForwarder is Initializable, OwnableUpgradeable {
    address public immutable target1;
    address public immutable target2;
    address public immutable target3;

    enum TargetIds {
        Target1,
        Target2,
        Target3
    }

    struct CallData {
        TargetIds targetId;
        bytes data;
    }

    constructor(address[3] memory _targets) {
        target1 = _targets[0];
        target2 = _targets[1];
        target3 = _targets[2];
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
