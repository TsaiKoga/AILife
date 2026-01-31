// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CharacterRegistry {
    struct Character {
        string name;
        string hairColor;
        bool hasGlasses;
        string personality;
        uint8 health;
        uint8 hunger;
        bool exists;
    }

    mapping(address => Character) public characters;

    event CharacterCreated(address indexed user, string name);
    event CharacterUpdated(address indexed user, uint8 health, uint8 hunger);

    function createCharacter(
        string memory _name,
        string memory _hairColor,
        bool _hasGlasses,
        string memory _personality
    ) external {
        require(!characters[msg.sender].exists, "Character already exists");

        characters[msg.sender] = Character({
            name: _name,
            hairColor: _hairColor,
            hasGlasses: _hasGlasses,
            personality: _personality,
            health: 100,
            hunger: 0,
            exists: true
        });

        emit CharacterCreated(msg.sender, _name);
    }

    function getCharacter(address _user) external view returns (Character memory) {
        return characters[_user];
    }
    
    function updateStats(uint8 _health, uint8 _hunger) external {
        require(characters[msg.sender].exists, "Character does not exist");
        characters[msg.sender].health = _health;
        characters[msg.sender].hunger = _hunger;
        emit CharacterUpdated(msg.sender, _health, _hunger);
    }
}
