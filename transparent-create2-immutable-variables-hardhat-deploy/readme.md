On the test I want to develop, I want to proof this following things:

- 1. I can deterministically deploy to different chains and get the same address, using the create2. (For this purpose I will be deploying myself an ImmutableCreate2Factory.sol to each chain)

- 2. I can perform upgrades adding a target4 new immutable variable on the implementation, while preserving the same address on the proxy

The objective of this task is to demonstrate that I can have immutable variables in the TransparentProxy pattern while keeping the same Proxy address across chains.
