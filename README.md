# NeutralNUS Terminal
>*NeutralNUS*: pronounced "neutralness"  (ˈnjuːtrəlnəs)

*NeutralNUS Terminal* is a BLE client that is a platform agnostic terminal for NUS - Nordicsemiconductor Uart Services (BLE UART) which connects to any device that supports NUS rather than specifically servicing particular hardware. Other solutions tend to serve specific hardware and require a specific setup. *NeutralNUS Terminal* aims to be as generic as possible, providing a pure terminal experience over BLE NUS.

---

## Download and Usage:
Please [download](https://github.com/KevinJohnMulligan/neutral-nus-terminal/releases) from releases and read the [release notes](https://github.com/KevinJohnMulligan/neutral-nus-terminal/releases)
---
---

### Terminology:
**NUS:** Nordicsemiconductor UART Service  <br />
**UART:** Universal Asynchronous Receiver-Transmitter  <br />
**BLE:** Bluetooth Low Energy, Bluetooth 4.0, Bluetooth 5.0  <br />
**BLE client/central:** A PC/mobile device that connects to BLE peripherals to collect data and send commands. The central device connects as a client to a BLE peripheral.  <br />
**BLE server/peripheral:** The small device that performs actions in the world. The peripheral device runs the BLE server. <br />
**Platform Agnostic:** Runs on Windows/Linux/macOS <br />

### Technology:
This project is based on [web-device-cli](https://github.com/makerdiary/web-device-cli) which makes use of the Web Bluetooth protocol. Additions were made using [React](https://reactjs.org/) and [NWjs](https://nwjs.io/) to convert web-device-cli into an agnostic desktop application.

##### To be implemented:
TCP backend:
- *NeutralNUS Terminal* will have a TCP server that allows any **local** connection to the NUS on the BLE peripheral
- *NeutralNUS Terminal* will have a TCP server that allows any **remote** connection to the NUS on the BLE peripheral



#### Etymology:

*What's in a name? **(too much)***

I originally thought of using **NUS4all** but found that this was used as a political hashtag so I dropped it.

Next I went for ***agnostic NUS***  written as ***ag-NUS***

- agnus means lamb in latin
- ag means silver on the period table of elements
- therefore I could have used a silver lamb to represent the project, but this seemed too religious given the project is meant to be agnostic after all :stuck_out_tongue_winking_eye:

After that ***JustNUS Terminal*** - Just this. Seemed a bit bland.

Finally I settled on ***NeutralNUS Terminal*** - pronounced neutralness  (ˈnjuːtrəlnəs)
