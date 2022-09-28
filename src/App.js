import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  appWindow,
  PhysicalSize,
  WebviewWindow,
  PhysicalPosition,
} from '@tauri-apps/api/window'
import { open } from '@tauri-apps/api/shell'
import queryString from 'query-string'

import { AppContext } from './contexts/index'
import windowOptions from './constants/windowOptions'
import './App.css'

import gas from './assets/gas.png'
import toTop from './assets/top.png'
import eye from './assets/eye.png'
import browser from './assets/browser.png'

import { Language } from './utils/language'

import EstimateGas from './components/EstimateGas'
import ListenVarByContract from './components/ListenVarByContract'

const windowManager = {}

const ComponentKeys = {
  EstimateGas: 'EstimateGas',
  ListenVarByContract: 'ListenVarByContract',
}

function App() {
  const [language, setLanguage] = useState(Language.EN)
  const [top, setTop] = useState(true)
  const [childrenComponentVisible, setChildrenComponentVisible] = useState({})
  const [nextBlockGasPrice, setNextBlockGasPrice] = useState(null)

  useEffect(() => {
    init()
  }, [])

  const init = () => {
    if (appWindow.label === 'main') {
      listenMainMove()
      toggleChildrenComponent(ComponentKeys.EstimateGas)
    }
    setSizeAndPosition()
  }

  useEffect(() => {
    getGas()
  }, [])

  const getGas = () => {
    setInterval(() => {
      axios({
        url: `https://api.blocknative.com/gasprices/blockprices`,
      })
        .then((res) => {
          setNextBlockGasPrice(res.data)
        })
        .catch((err) => {
          console.log(err)
        })
    }, 1500)
  }

  const moveAllComponents = async (parentX, parentY) => {
    const mainSize = await appWindow.outerSize()
    // 重设gas预估窗口的位置
    if (windowManager[ComponentKeys.EstimateGas]) {
      const win1Szie = await windowManager[
        ComponentKeys.EstimateGas
      ].outerSize()
      const x1 = parentX - win1Szie.width - 1
      const y1 = parentY - win1Szie.height + mainSize.height
      windowManager[ComponentKeys.EstimateGas].setPosition(
        new PhysicalPosition(x1, y1),
      )
    }
    // 重设变量监听窗口的位置
    if (windowManager[ComponentKeys.ListenVarByContract]) {
      const x3 = parentX + mainSize.width + 1
      const y3 = parentY
      windowManager[ComponentKeys.ListenVarByContract].setPosition(
        new PhysicalPosition(x3, y3),
      )
    }
  }

  const listenMainMove = () => {
    appWindow.listen('tauri://move', ({ payload }) => {
      const { x, y } = payload
      moveAllComponents(x, y)
    })
  }

  const setSizeAndPosition = async () => {
    const mainContent = document.getElementById('main-content')
    const h = mainContent.offsetHeight
    const w = mainContent.offsetWidth
    await appWindow.setSize(
      new PhysicalSize(parseInt(w) - 16, parseInt(h) - 40),
    )
    if (appWindow.label === 'main') return
    // 设置子窗口的位置
    let { parentW, parentH, parentX, parentY } = queryString.parse(
      window.location.search,
    )
    parentW = parseInt(parentW)
    parentH = parseInt(parentH)
    parentX = parseInt(parentX)
    parentY = parseInt(parentY)
    let x, y
    if (appWindow.label === ComponentKeys.EstimateGas) {
      x = parentX - w - 1
      y = parentY - h + parentH
    }
    if (appWindow.label === ComponentKeys.ListenVarByContract) {
      x = parentX + parentW + 1
      y = parentY
    }
    appWindow.setPosition(new PhysicalPosition(x, y))
  }

  // 切换显示Gas页面
  const toggleChildrenComponent = async (componentName) => {
    if (!childrenComponentVisible[componentName]) {
      if (windowManager[componentName]) {
        windowManager[componentName].show()
      } else {
        const mainPosition = await appWindow.outerPosition()
        const mainSize = await appWindow.outerSize()
        windowManager[componentName] = new WebviewWindow(componentName, {
          ...windowOptions,
          url: `?children=${componentName}&parentW=${mainSize.width}&parentH=${mainSize.height}&parentX=${mainPosition.x}&parentY=${mainPosition.y}`,
        })
      }
    } else {
      windowManager[componentName].hide()
    }
    setChildrenComponentVisible({
      ...childrenComponentVisible,
      [componentName]: !childrenComponentVisible[componentName],
    })
  }

  const toTopHandle = () => {
    setTop(!top)
    appWindow.setAlwaysOnTop(!top)
    Object.keys(windowManager).map((key) => {
      windowManager[key].setAlwaysOnTop(!top)
    })
  }

  const openWebsite = () => {
    open('https://cryptoweb3.tools')
  }

  const getStatus = () => {
    if (!nextBlockGasPrice) return
    const blockPrices = nextBlockGasPrice?.blockPrices[0]
    const onePriority = blockPrices.estimatedPrices[0].maxPriorityFeePerGas
    const warnValue = blockPrices?.baseFeePerGas + onePriority
    if (warnValue > 260) {
      return 'alarm_gas'
    }
    if (warnValue > 200) return 'warning_gas'
    return ''
  }

  // 渲染子组件
  const renderComponent = () => {
    if (appWindow.label === 'main') return
    const { children } = queryString.parse(window.location.search)
    if (children === ComponentKeys.EstimateGas) {
      return <EstimateGas blockPrices={blockPrices} />
    }
    if (children === ComponentKeys.ListenVarByContract) {
      return <ListenVarByContract />
    }
  }

  const blockPrices = nextBlockGasPrice?.blockPrices[0]

  return (
    <AppContext.Provider
      value={{
        language: language,
      }}
    >
      {renderComponent() || (
        <div id="main-content">
          <div data-tauri-drag-region className={`ball ${getStatus()}`}>
            <div className="gas">
              <div>{(blockPrices?.baseFeePerGas || 0).toFixed(2)}</div>
              <div className="prority">
                {(
                  blockPrices?.estimatedPrices[0]?.maxPriorityFeePerGas || 0
                ).toFixed(2)}
              </div>
            </div>
            <div className="action">
              <img
                className={
                  childrenComponentVisible[ComponentKeys.EstimateGas]
                    ? 'top'
                    : ''
                }
                src={gas}
                alt="top"
                onClick={() =>
                  toggleChildrenComponent(ComponentKeys.EstimateGas)
                }
              />
              <img src={browser} alt="browser" onClick={openWebsite} />
              <img
                className={top ? 'top' : ''}
                onClick={toTopHandle}
                src={toTop}
                alt="top"
              />

              <img
                className={
                  childrenComponentVisible[ComponentKeys.ListenVarByContract]
                    ? 'top'
                    : ''
                }
                src={eye}
                alt="translation"
                onClick={() =>
                  toggleChildrenComponent(ComponentKeys.ListenVarByContract)
                }
              />
            </div>
          </div>
        </div>
      )}
    </AppContext.Provider>
  )
}

export default App
