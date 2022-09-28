import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { appWindow, PhysicalSize } from '@tauri-apps/api/window'

import { WalletReg } from '../constants/Regular'
import { sleep } from '../utils/index'
import '../styles/ListenVarByContract.css'

const rpcURL = `https://rpc.ankr.com/eth`
const provider = ethers.getDefaultProvider(rpcURL)

let firstRender = true
let watchingGlobal = false
function ListenVarByContract() {
  const [watching, setWatching] = useState(false)
  const [contractAddress, setContractAddress] = useState('')
  const [contractVars, setContractVars] = useState(
    'address:owner,uint256:totalSupply',
  )
  const [varResult, setVarResult] = useState({})
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (firstRender) {
      firstRender = false
      return
    }
    updateWindowHeight()
  }, [contractVars?.split(',').filter((_) => !!_).length])

  const updateWindowHeight = async () => {
    const varLen = contractVars?.split(',').filter((_) => !!_).length
    const size = await appWindow.outerSize()
    appWindow.setSize(new PhysicalSize(size.width - 16, varLen * 31 - 46 + 120))
  }

  const handleListenVar = (e) => {
    const { value } = e.target
    setContractVars(value.replace(/\s+/g, ''))
  }

  const handleAddressChange = (e) => {
    const address = e.target.value
    if (!WalletReg.test(address) && address) {
      setErrorMsg('请输入格式正确的合约地址')
      return
    }
    setErrorMsg('')
    setContractAddress(address)
  }

  const start = () => {
    if (watching) {
      setWatching(false)
      watchingGlobal = false
      setTimeout(() => setErrorMsg(''), 100)
      return
    }
    startWatching()
  }

  // 开始/停止监听合约变量
  const startWatching = async () => {
    if (!contractAddress) {
      setErrorMsg('请输入合约地址')
      return
    }
    if (!contractVars) {
      setErrorMsg('请输入监听的变量地址')
      return
    }
    setErrorMsg('')
    setWatching(true)
    watchingGlobal = true
    const readAbi = []
    const keys = contractVars?.split(',').filter((_) => !!_) || []
    keys.forEach((key) => {
      const fun = {
        inputs: [],
        stateMutability: 'view',
        type: 'function',
      }
      const type = key.split(':')[0]
      fun.name = key.split(':')[1].split('|')[0]
      const funParse = key.split(':')[1].split('|')[1]
      if (funParse) {
        const varType = funParse.split('=')[0]
        fun.inputs = [{ name: '', type: varType }]
      }
      fun.outputs = [{ name: '', type: type }]
      readAbi.push(fun)
    })
    const readAbiStr = JSON.stringify(readAbi)
    const contract = new ethers.Contract(contractAddress, readAbiStr, provider)
    let list = varResult
    do {
      keys.forEach((key) => {
        const readFunName = key.split(':')[1].split('|')[0]
        const funParse = key.split(':')[1].split('|')[1]
        const parse = []
        if (funParse) {
          const value = funParse.split('=')[1]
          parse.push(value)
        }
        contract[readFunName](...parse)
          .then((res) => {
            list = {
              ...list,
              [key]: res.toString(),
            }
            setVarResult(list)
          })
          .catch(() => {
            setErrorMsg('获取参数失败，请检查合约或变量是否正确')
          })
      })
      await sleep(1000)
    } while (watchingGlobal)
  }

  // 渲染监听合约变量的模态框
  const renderListenContractVar = () => {
    return (
      <div className="contract_var_box">
        <div className="result">
          {contractVars
            ?.split(',')
            .filter((_) => !!_)
            .map((key, index) => {
              try {
                const readFunName = key.split(':')[1].split('|')[0]
                const funParse = key.split(':')[1].split('|')[1]
                let parse
                if (funParse) parse = funParse.split('=')[1]
                return (
                  <div className="item" key={index}>
                    {readFunName}
                    {parse !== undefined ? `(${parse})` : ''}:
                    <span>{varResult[key]}</span>
                  </div>
                )
              } catch (error) {
                setErrorMsg('获取参数失败，请检查合约或变量是否正确')
                console.log(error)
              }
            })}
        </div>
      </div>
    )
  }

  return (
    <div id="main-content">
      <div className="listen_var_by_contract">
        <div className="action">
          <input
            type="text"
            disabled={watching}
            value={contractAddress}
            placeholder="contract address"
            onChange={handleAddressChange}
          />
          <input
            type="text"
            disabled={watching}
            value={contractVars}
            onChange={handleListenVar}
          />
          <button onClick={start} className={watching ? 'watching' : ''}>
            {watching ? '停止监控' : '开始监控'}
          </button>
        </div>
        <div className="pending">
          例子:<span>{'address:owner,uint256:totalSupply'}</span>
          <br />
          传参:<span>{'address:ownerOf|uint256=1'}</span>
        </div>
        {renderListenContractVar()}
        <div className="error_msg">{!!errorMsg && errorMsg}</div>
      </div>
    </div>
  )
}

export default ListenVarByContract
