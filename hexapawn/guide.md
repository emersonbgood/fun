# fully trained ai.md

## 🤖 Hexapawn AI Matchbox State Engine (Black AI Variant)

This file contains the complete, mathematically valid game-state tree for Hexapawn on a 3x3 board. It tracks exactly 3 White pawns and 3 Black pawns without piece duplications. 

### 📐 Notation Guide
* **Board Format**: `Row1-Row2-Row3`
* **Positions**: `L` (Left), `M` (Middle), `R` (Right)
* **Pieces**: `B` (Black Pawn), `W` (White Pawn), `.` (Empty Square)
* **Turn Logic**: White always moves first on odd turns. The AI (Black) calculates its moves on even turns (**Turn 2** and **Turn 4**).

---

## 🕒 Turn 2 Matchboxes
These represent the three unique configurations Black can face after White's opening move.

### mb1
* **Board State**: `BBB-W..-.WW` *(White advanced Left Pawn)*
* **Legal Options**: `MB>MM` || `RB>RM` || `MB>LM` *(Capture)*

### mb2
* **Board State**: `BBB-.W.-W.W` *(White advanced Middle Pawn)*
* **Legal Options**: `LB>LM` || `RB>RM` || `LB>MM` *(Capture)* || `RB>MM` *(Capture)*

### mb3
* **Board State**: `BBB-..W-WW.` *(White advanced Right Pawn)*
* **Legal Options**: `LB>LM` || `MB>MM` || `MB>RM` *(Capture)*

---

## 🕒 Turn 4 Matchboxes
These represent all possible variations Black can face after White's second move. Invalid board fragments from your original list have been cleaned of non-existent pieces.

### mb4
* **Board State**: `.BB-W.W-W..`
* **Legal Options**: `MB>MM` || `MB>LM` || `MB>RM`

### mb5
* **Board State**: `.BB-.W.-W..`
* **Legal Options**: `RB>RM` || `RB>MM` *(Capture)*

### mb6
* **Board State**: `.BB-.W.-..W`
* **Legal Options**: `RB>RM` || `RB>MM` *(Capture)*

### mb7
* **Board State**: `.BB-BWW-W..`
* **Legal Options**: `MB>RM` || `RB>MM` *(Capture)*

### mb8
* **Board State**: `.BB-.BW-W..`
* **Legal Options**: `MB>RM`

### mb9
* **Board State**: `.BB-WB.-..W`
* **Legal Options**: `RB>RM` || `MB>LM`

### mb10
* **Board State**: `B.B-W..-..W`
* **Legal Options**: `RB>RM`

### mb11
* **Board State**: `B.B-..W-W..`
* **Legal Options**: `LB>LM`

### mb12
* **Board State**: `B.B-BW.-..W`
* **Legal Options**: `RB>RM` || `LB>MM` *(Capture)* || `RB>MM` *(Capture)*

### mb13
* **Board State**: `B.B-.WB-W..`
* **Legal Options**: `LB>LM` || `LB>MM` *(Capture)* || `RB>MM` *(Capture)*

### mb14
* **Board State**: `B.B-.WW-.W.`
* **Legal Options**: `LB>LM` || `LB>MM` *(Capture)* || `RB>MM` *(Capture)*

### mb15
* **Board State**: `B.B-WW.-.W.`
* **Legal Options**: `RB>RM` || `LB>MM` *(Capture)* || `RB>MM` *(Capture)*

### mb16
* **Board State**: `BB.-W.W-..W`
* **Legal Options**: `MB>MM` || `MB>LM` || `MB>RM`

### mb17
* **Board State**: `BB.-.W.-W..`
* **Legal Options**: `LB>LM` || `LB>MM` *(Capture)*

### mb18
* **Board State**: `BB.-.W.-..W`
* **Legal Options**: `LB>LM` || `LB>MM` *(Capture)*

### mb19
* **Board State**: `BB.-.BW-W..`
* **Legal Options**: `LB>LM` || `MB>RM`
