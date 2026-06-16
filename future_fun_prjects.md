# Raspberry Pi Pico & Pi 500 Master Project Guide

Welcome to your ultimate manual coding project playbook. This guide is tailored exactly to your specific component inventory. It contains 20 progressive hardware and software projects designed to teach you raw embedded programming without relying on AI generators.

---

## 📋 Table of Contents
1. [Master Component Inventory & Hardware Rules](#-master-component-inventory--hardware-rules)
2. [Beginner Projects (1 to 5): Core Digital & Analog Foundations](#-beginner-projects-1-to-5-core-digital--analog-foundations)
3. [Intermediate Projects (6 to 12): Sensors, Servos, and Protocols](#-intermediate-projects-6-to-12-sensors-servos-and-protocols)
4. [Advanced Projects (13 to 17): Automation, Relays, and Transistors](#-advanced-projects-13-to-17-automation-relays-and-transistors)
5. [Expert & Connected Projects (18 to 20): Pi 500 Full-Stack Integration](#-expert--connected-projects-18-to-20-pi-500-full-stack-integration)

---

## 🛠 Master Component Inventory & Hardware Rules

### Your Hardware Stockpile
*   **Processing:** 1x Raspberry Pi 500 (Linux/Development Host), 1x RP2040 Pico 1H, 1x RP2040 Pico 1WH (Wi-Fi enabled).
*   **Security & ID:** 2x RFID RC522 Modules, 2x Keycards, 2x Key fobs.
*   **Motion & Input:** 7x Servo Motors, 2x Analog Joysticks, 100x Tactile Push Buttons, 1x "Twisty Knob Thingy" (Potentiometer / Rotary Encoder).
*   **Sensors:** 2x Ultrasonic Distance Sensors, 2x PIR Motion Sensors, 2x Color Sensors, 1x MQ Gas/Smoke Sensor, 1x Soil Water Humidity Sensor, 1x DHT Air Humidity/Temperature Sensor.
*   **Power & Switching:** 300x Bipolar Junction Transistors (BJTs), 12x DPDT Relays, Massive Resistor Assortment (1Ω to 1MΩ).
*   **Wireless:** 2x Bluetooth Modules, 3x ESP01s Wi-Fi Modules.

### ⚠️ Golden Rules of Hardware Safety
1.  **The Relay Transistor Law:** Never connect a Relay Coil directly to a Pico pin. The coil draws too much current and back-EMF spikes will kill the RP2040. Always drive a transistor base from the Pico pin, and let the transistor switch the relay coil.
2.  **The 3.3V Input Limit:** The Pico GPIO pins are **not 5V tolerant**. If you power a sensor with 5V, its data return line must pass through a resistor voltage divider before hitting your Pico input pin.
3.  **No Partridges, No Pear Trees:** Keep your 200V mains power jokes completely away from the breadboard!

---

## 🟢 Beginner Projects (1 to 5): Core Digital & Analog Foundations

### Project 1: Multi-Rate Visual Metronome
*   **Concept:** Use your twisty knob to adjust the flashing speed of 3 external binary LEDs. 
*   **Components:** Pico 1H, Potentiometer, 3x LEDs, 3x 220Ω Resistors.
*   **Library Focus:** `machine.ADC`, `machine.Pin`, `time.sleep_ms()`.

### Project 2: Reflex Speed Tester Game
*   **Concept:** The onboard LED lights up at a random time. Two players race to hit their respective buttons. The Pico locks out the loser and flashes the winner's LED.
*   **Components:** Pico 1H, 2x Buttons, 2x LEDs, 2x 220Ω Resistors.
*   **Library Focus:** `machine.Pin`, `time.ticks_ms()`, `random`.

### Project 3: Micro-Servo Dial Gauge
*   **Concept:** Map the 180-degree physical rotation of your potentiometer twisty knob directly to a single servo motor pointer.
*   **Components:** Pico 1H, Potentiometer, 1x Servo.
*   **Library Focus:** `machine.PWM`, scaling math equations.

### Project 4: Binary Count-Up / Count-Down Tracker
*   **Concept:** Expand your 4-bit binary counter by adding a second button. Button A counts up, Button B counts down.
*   **Components:** Pico 1H, 2x Buttons, 3x External LEDs, 3x 220Ω Resistors.
*   **Library Focus:** Advanced bitwise shifting and conditional edge case handling.

### Project 5: Morse Code S.O.S. Flasher
*   **Concept:** A safety beacon script that uses precise code timing loops to broadcast S.O.S. via the onboard LED indefinitely.
*   **Components:** Pico 1H (Standalone).
*   **Library Focus:** Python function creation, clean array parsing of dot/dash timings.

---

## 🟡 Intermediate Projects (6 to 12): Sensors, Servos, and Protocols

### Project 6: Digital Tape Measure
*   **Concept:** Bounce soundwaves off a wall to calculate physical distance. Print the precise metric distance straight to your Thonny IDE console.
*   **Components:** Pico 1H, 1x Ultrasonic Distance Sensor.
*   **Library Focus:** Reading precise high/low microsecond pulses with `time.ticks_us()`.

### Project 7: Automated Plant Thirst Indicator
*   **Concept:** Read moisture levels inside a soil pot. If the soil dries out past a specific threshold, flash a red alert LED.
*   **Components:** Pico 1H, Water Humidity Sensor, 1x LED, 1x 220Ω Resistor.
*   **Library Focus:** Analog calibration maps, threshold limit logic.

### Project 8: Intruder-Sensing Pan/Tilt Camera Mount
*   **Concept:** Use two PIR sensors to check two zones. If Zone A detects movement, a dual-servo mount points towards Zone A. If Zone B triggers, it snaps to Zone B.
*   **Components:** Pico 1H, 2x PIR Motion Sensors, 2x Servos.
*   **Library Focus:** Pin change polling and multi-axis servo alignment.

### Project 9: Industrial Sorting Gate (Color Recognition)
*   **Concept:** Identify whether an object is Red or Blue using your color sensor, then activate a servo arm to push it into the correct lane.
*   **Components:** Pico 1H, 1x Color Sensor, 1x Servo.
*   **Library Focus:** Managing the I2C communications bus (`machine.I2C`).

### Project 10: Joystick Crane Controller
*   **Concept:** Map a 2-axis analog joystick to smoothly position two independent servo joints (X and Y movement).
*   **Components:** Pico 1H, 1x Joystick, 2x Servos.
*   **Library Focus:** Dual ADC parsing and drift compensation.

### Project 11: The RFID Door Lock Latch
*   **Concept:** Scan an RFID card. If the UID token matches your hardcoded keycard, clear the lock by turning a servo 90 degrees. Flash a red LED if denied.
*   **Components:** Pico 1H, 1x RFID RC522, 1x Servo, 1x LED.
*   **Library Focus:** Managing the SPI protocol bus (`machine.SPI`).

### Project 12: Digital Air Quality Monitor
*   **Concept:** Continually read temperature and humidity spikes. Print structured readouts to your development window.
*   **Components:** Pico 1H, DHT Air Temperature/Humidity Sensor.
*   **Library Focus:** Importing external driver files and handling float numbers.

---

## 🟠 Advanced Projects (13 to 17): Automation, Relays, and Transistors

### Project 13: Workplace Toxic Vapor Vent Fan
*   **Concept:** Your MQ sensor smells dangerous gas or smoke fumes. The Pico uses a transistor to fire a heavy DPDT Relay coil, turning on a mock ventilation fan.
*   **Components:** Pico 1H, MQ Sensor, 1x Transistor (e.g., 2N2222), 1x DPDT Relay, 1x 1kΩ base resistor.
*   **Library Focus:** Low-latency sensor thresholds and electronic switching isolation.

### Project 14: Non-Blocking Hardware Timer Clock
*   **Concept:** Build a system that tracks background operations and flashes lights at precise rates *without ever using a single time.sleep()* statement.
*   **Components:** Pico 1H, 2x LEDs, 2x Resistors.
*   **Library Focus:** `machine.Timer`, asynchronous callback functions.

### Project 15: Dual-Stage RFID Security Checkpoint
*   **Concept:** Require *both* a valid RFID card sweep and an analog joystick combination pattern to authorize an external circuit execution.
*   **Components:** Pico 1H, 1x RFID reader, 1x Joystick.
*   **Library Focus:** Nested state machine logic paths.

### Project 16: Transistor H-Bridge Motor Direction Simulator
*   **Concept:** Use 4 transistors in a bridge configuration to prove you can reverse current direction to change motor spin directions using raw digital outputs.
*   **Components:** Pico 1H, 4x Transistors, various resistors.
*   **Library Focus:** Inter-pin interlocking logic to prevent physical short circuits.

### Project 17: Multi-Point Intruder Alarm Array
*   **Concept:** Daisy-chain multiple distance and motion sensors into a unified security bus. If any sensor threshold trips, latch a relay lock.
*   **Components:** Pico 1H, 2x Distance Sensors, 2x PIR Sensors, 1x Relay, 1x Transistor.
*   **Library Focus:** Boolean logic array tracking.

---

## 🔵 Expert & Connected Projects (18 to 20): Pi 500 Full-Stack Integration

### Project 18: Wireless Weather Node (Pico WH to Pi 500 Dashboard)
*   **Concept:** Mount the Pico 1WH across the room reading air metrics. Broadcast the metrics wirelessly across your network straight to your Pi 500 terminal display.
*   **Components:** Pico 1WH, DHT Air Sensor, Raspberry Pi 500.
*   **Library Focus:** MicroPython `network` socket libraries and TCP/IP messaging.

### Project 19: Linux-Triggered Physical Security Deadbolt
*   **Concept:** Write a script on your Pi 500's Linux terminal. Type a command into Linux to send an executive signal over Wi-Fi instructing the Pico 1WH to latch or unlatch a physical servo deadlock.
*   **Components:** Raspberry Pi 500, Pico 1WH, 1x Servo.
*   **Library Focus:** Micro-Python HTTP/Webservers and incoming packet string slicing.

### Project 20: The Robotic Arm Copycat (Full Inventory Showcase)
*   **Concept:** Build a master-slave controller loop. You move an arm fitted with joysticks, color sensors, and distances. The Pico coordinates these values to drive all 7 servos in unified symmetry.
*   **Components:** Pico 1H, Pico 1WH, 7x Servos, 2x Joysticks, 2x Distance Sensors.
*   **Library Focus:** High-density hardware management and maximum array processing performance.
