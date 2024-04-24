path=build/flatten
mkdir -p $path
yarn flat contracts/base/XTokenBacking.sol --output $path/XTokenBacking.sol
yarn flat contracts/base/XTokenIssuing.sol --output $path/XTokenIssuing.sol
yarn flat contracts/templates/GuardV3.sol --output $path/GuardV3.sol
yarn flat contracts/templates/XRingConvertor.sol --output $path/XRingConvertor.sol
yarn flat contracts/templates/WTokenConvertor.sol --output $path/WTokenConvertor.sol
