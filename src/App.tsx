import { useEffect, useState } from 'react'
import { ScanLine, ShoppingCart, Trash2, Receipt, PlusCircle, CheckCircle, CreditCard, Banknote, Receipt as ReceiptIcon, LogIn } from 'lucide-react'

type Product = {
  name: string;
  price: number;
};

const products: Record<string, Product> = {
  '123': { name: 'eggs', price: 2.99 },
  '456': { name: 'bread', price: 5.50 },
  '789': { name: 'milk', price: 4.80 },
  '741': { name: 'carrot', price: 3.50 },
  '852': { name: 'lemon', price: 2.50 },
  '963': { name: 'salt', price: 6.00 },
  '753': { name: 'chicken', price: 8.99 },
  '951': { name: 'water bottle', price: 3.99 },
  '321': { name: 'sugar', price: 2.99 },
  '654': { name: 'flour', price: 1.99 },
  '987': { name: 'watermelon', price: 4.99 },
}

type Cashiers = { [key: string]: { name: string } };

const cashiers: Cashiers = {
  'abc123': { name: 'John' },
  'qwe789': { name: 'Mike' },
  'asd456': { name: 'Linda' },
}

type cartItem = {
  code: string,
  name: string,
  price: number,
  quantity: number
}

type PaymentMethod = 'money' | 'debit' | 'credit' | 'voucher' | null

function App() {
  const [code, setCode] = useState('')
  const [cart, setCart] = useState<cartItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null)
  const [cashAmount, setCashAmount] = useState('')
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [paymentInput, setPaymentInput] = useState('')
  const [cashierCode, setCashierCode] = useState<{ code: string; name: string } | null>(null)
  const [currentCashier, setCurrentCashiser] = useState<{ code: string; name: string } | null>(null)
  const [loginError, setLoginError]
    = useState<string | null>(null)

  useEffect(() => {
    if (showPaymentOptions && !paymentMethod) {
      const handleKeyPress = (e: KeyboardEvent) => {
        const key = e.key
        if (['1', '2', '3', '4'].includes(key)) {
          setPaymentInput(key)
          const methodMap: Record<string, PaymentMethod> = {
            '1': 'money',
            '2': 'debit',
            '3': 'credit',
            '4': 'voucher',
          }
          handlePaymentMethodSelect(methodMap[key])
        }
      }
      window.addEventListener('keypress', handleKeyPress)
      return () => window.removeEventListener('keypress', handleKeyPress)
    }
  }, [showPaymentOptions, paymentMethod])

  const handleCashierLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const formattedCode = cashierCode?.code.toLowerCase();
    if (formattedCode) {
      const cashier = cashiers[formattedCode];
      if (cashier) {
        setCurrentCashiser({ code: formattedCode, name: cashier.name });
        setLoginError(null);
        setCashierCode(null);
      } else {
        setLoginError('Cashier Code Not Found. Try Again');
      }
    } else {
      setLoginError('Invalid Cashier Code');
    }
  }

  const handleLogout = () => {
    setCurrentCashiser(null)
    startNewTransaction()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formattedCode = code.toLowerCase()

    setError(null)

    const product = products[formattedCode]
    if (!product) {
      setError('Product code not found')
      return
    }


    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.code === formattedCode)
      if (existingItem) {
        return currentCart.map(item =>
          item.code === formattedCode
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...currentCart, { code: formattedCode, ...product, quantity: 1 }]
    })

    setCode('')
  }

  const removeItem = (code: string) => {
    setCart(cart.filter(item => item.code !== code))
  }

  const updateQuantity = (code: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setCart(cart.map(item =>
      item.code === code ? { ...item, quantity: newQuantity } : item
    ))
  }

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method)
    if (method !== 'money') {
      setIsFinished(true)
    }
  }

  const handleCashPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (parseFloat(cashAmount) >= getTotalPrice()) {
      setIsFinished(true)
    } else {
      setError('Insufficient payment Amount')
    }
  }

  const getChange = () => {
    if (paymentMethod !== 'money' || !cashAmount) return 0
    return parseFloat(cashAmount) - getTotalPrice()
  }

  const finishTransaction = () => {
    setShowPaymentOptions(true)
  }

  const startNewTransaction = () => {
    setCart([])
    setIsFinished(false)
    setError(null)
    setCode('')
    setPaymentMethod(null)
    setCashAmount('')
    setShowPaymentOptions(false)
    setPaymentInput('')
  }

  const renderPaymentSelection = () => (
    <div className='text-center py-8'>
      <h2 className='text-2xl font-bold text-gray-800 mb-6'>Select Payment Method</h2>
      <p className='text-gray-600 mb-6'>
        1. Cash
        <br />
        2. Debit
        <br />
        3. Credit
        <br />
        4. Voucher
      </p>
      <div className='grid grid-cols-2 gap-4 max-w-xl mx-auto'>
        <button onClick={() => handlePaymentMethodSelect('money')}
          className={`p-4 bg-green-50 hover:bg-green-100 border-2 ${paymentInput === '1' ? 'border-green-500' : 'border-green-200'} rounded-lg flex flex-col items-center gap-2`}>
          <Banknote className="h-8 w-8 text-green-600" />
          <span className='font-medium'> 1. Money</span>
        </button>

        <button onClick={() => handlePaymentMethodSelect('debit')}
          className={`p-4 bg-blue-50 hover:bg-blue-100 border-2 ${paymentInput === '2' ? 'border-blue-500' : 'border-blue-200'} rounded-lg flex flex-col items-center gap-2`}>
          <CreditCard className="h-8 w-8 text-blue-600" />
          <span className='font-medium'> 2. Debit</span>
        </button>

        <button onClick={() => handlePaymentMethodSelect('credit')}
          className={`p-4 bg-purple-50 hover:bg-purple-100 border-2 ${paymentInput === '4' ? 'border-purple-500' : 'border-purple-200'} rounded-lg flex flex-col items-center gap-2`}>
          <CreditCard className="h-8 w-8 text-purple-600" />
          <span className='font-medium'> 3. Credit</span>
        </button>

        <button onClick={() => handlePaymentMethodSelect('voucher')}
          className={`p-4 bg-yellow-50 hover:bg-yellow-100 border-2 ${paymentInput === '5' ? 'border-yellow-500' : 'border-yellow-200'} rounded-lg flex flex-col items-center gap-2`} >
          <ReceiptIcon className="h-8 w-8 text-yellow-600" />
          <span className='font-medium'> 3. Voucher</span>
        </button>

      </div>
    </div>
  )

  const renderCashPayment = () => (
    <div className='text-center py-8'>
      <h2 className='text-2xl font-bold text-gray-800 mb-6'>Total: U${getTotalPrice().toFixed(2)}</h2>
      <form onSubmit={handleCashPayment} className='max-w-sm mx-auto'>
        <div className='mb-4'>
          <label htmlFor="cashAmount" className='block text-sm  font-medium text-gray-700 mb-2'>
            Money received:
          </label>
          <input type="number" id='cashAmount' step='0.01' min={getTotalPrice()} value={cashAmount} onChange={(e) => setCashAmount(e.target.value)} className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none  focus-border-green-500 transition-colors' placeholder='Enter amount' required autoFocus />
        </div>
        {error && <p className='text-red-600 mb-4'>{error}</p>}
        <button type='submit' className='px-6 py-3 bg-green-600 text-white rounderd-lg hover:bg-green-700 transition-colors font-medium'>Exchange</button>
      </form>
    </div>
  )

  const renderLoginForm = () => (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to bg-indigo-100 p-4 flex items-center justify-center'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8'>
        <div className='flex items-center justify-center mb-8'>
          <LogIn className="h-12 w-12 text-indigo-600" />
        </div>
        <h1 className='text-2-l font-bold text-center text-gray-800 mb-8'>
          Cashier Login
        </h1>
        <form onSubmit={handleCashierLogin} className='space-y-6'>
          <div>
            <label htmlFor="cashierCode" className='block text-sm font-medium text-gray-700 mb-2'>
              Cashier Code
            </label>
            <input
              type="text"
              id="cashierCode"
              value={cashierCode?.code || ''}
              onChange={(e) => setCashierCode({ code: e.target.value, name: '' })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="Enter your cashier code"
              required
              autoFocus
            />
          </div>
          {loginError && (
            <p className=' text-red-600 text-sm'>{loginError}</p>
          )}
          <button type='submit' className='w-ful px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium'>
            Login
          </button>
        </form>
        <div className='mt-8 border-t pt-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-3'>Test Cashiers code</h2>
          {Object.entries(cashiers).map(([code, cashier]) => (
            <div key={code} className='flex justify-between'>
              <span>{cashier.name}</span>
              <span className='font-mono'>{code}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (!currentCashier) {
    return renderLoginForm()
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from blue-50 to-indigo-100 p-4'>
        <div className='max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-6'>
          <div className='flex items-center justify-between mb-6'>
            <div className='flex flex-col items-center md:flex-row'>
              <ShoppingCart className="h-10 w-10 text-indigo-600" />
              <h1 className='text-2xl font-b1ld text-gray-800 ml-3'>
                React Market</h1>
            </div>

            <div className='flex flex-col md:flex-row items-center gap-4'>
              <div className='text-tight'>
                <p className='text-sm text-gray-600'>Logged in as:</p>
                <p className='font-medium text-gray-800'>{currentCashier.name}</p>
              </div>
              <button onClick={handleLogout} className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center gap-2'>
                <LogIn className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          {!showPaymentOptions ? (
            <>
              <form onSubmit={handleSubmit} className='mb-6'>
                <div className='flex gap-4'>
                  <div className='flex-1'>
                    <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder='Scan or enter product code' className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-colors' maxLength={9} autoFocus />
                  </div>
                  <button type='submit' className='px-6 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2'>
                    <ScanLine className='h-5 w-5 text-white' />
                    Add
                  </button>
                </div>
                {error && (
                  <p className='mt-2 text-red-600 text-sm'>{error}</p>
                )}
              </form>

              <div className="border rounded-lg overflow-hidden">

                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_28px] md:grid md:grid-cols-6 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  <div className="text-center font-semibold text-gray-800 ">Product</div>
                  <div className="text-center font-semibold text-gray-800 ">Code</div>
                  <div className="text-center font-semibold text-gray-800 ">Price</div>
                  <div className="text-center font-semibold text-gray-800">Quantity</div>
                  <div className="text-center font-semibold text-gray-800">Total</div>
                  <div className="text-center font-semibold text-gray-800"></div>
                </div>


                <div className="divide-y divide-gray-200">
                  {cart.map((item) => (
                    <div key={item.code} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_28px] md:grid md:grid-cols-6 hover:bg-gray-50 px-4 py-3 items-center">

                      <div className="text-center text-gray-800">{item.name}</div>

                      <div className="text-center text-gray-600">{item.code}</div>

                      <div className="text-center text-gray-800">${item.price.toFixed(2)}</div>

                      <div className="flex items-center justify-center md:gap-2">
                        <button onClick={() => updateQuantity(item.code, item.quantity - 1)} className="p-1 hover:bg-gray-200 rounded">
                          -
                        </button>
                        <span className="md:w-8 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.code, item.quantity + 1)} className="p-1 hover:bg-gray-200 rounded">
                          +
                        </button>
                      </div>

                      <div className="text-center font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                      <div>
                        <button
                          onClick={() => removeItem(item.code)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-6 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800">
                  <div className="col-span-4 text-right">Total:</div>
                  <div className="text-center font-bold ">${getTotalPrice().toFixed(2)}</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={finishTransaction}
                  disabled={cart.length === 0}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Receipt className="h-5 w-5" />
                  Finish
                </button>
              </div>
            </>
          ) : !isFinished ? (
            paymentMethod === 'money' ? renderCashPayment() : renderPaymentSelection()
          ) : (
            <div className='text-center py-8'>
              <div className='mb-4'>
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Transaction Finished</h2>
              <p className='text-gray-600 mb-2'>Total: ${getTotalPrice().toFixed(2)}</p>
              {paymentMethod === 'money' && (
                <>
                  <p className='text-gray-600 mb-2'>Received: ${parseFloat(cashAmount).toFixed(2)}</p>
                  <p className='text-gray-600 mb-6'>Change: ${getChange().toFixed(2)}</p>
                </>
              )}

              <button onClick={startNewTransaction} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 mx-auto"
              >
                <PlusCircle className="h-5 w-5" />
                New Transaction
              </button>
            </div>
          )}

          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Products:</h2>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              {Object.entries(products).map(([code, product]) => (
                <div key={code} className="flex justify-between">
                  <span>{product.name}</span>
                  <span className="font-mono">{code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App
