import { useNavigate, useSearchParams } from "react-router-dom";
import { ChainConfig, Token, TokenOption, UrlSearchParamKey } from "../types";
import {
  getSourceChainOptions,
  getSourceTokenOptions,
  getTargetChainOptions,
  getTargetTokenOptions,
  getTokenOptions,
} from "../utils";
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  createContext,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSetAtom } from "jotai";
import { selectedSourceChainAtom } from "../store/chain";

interface TransferCtx {
  token: TokenOption;
  amount: { input: string; value: bigint; valid: boolean; alert: string };
  sourceChainOptions: ChainConfig[];
  targetChainOptions: ChainConfig[];
  sourceChain: ChainConfig;
  targetChain: ChainConfig;
  sourceToken: Token;
  targetToken: Token;
  isSwitchAvailable: (sourceChain: ChainConfig, targetChain: ChainConfig) => boolean;
  setAmount: Dispatch<SetStateAction<{ input: string; value: bigint; valid: boolean; alert: string }>>;
  handleTokenChange: (value: TokenOption) => void;
  handleSourceChainChange: (value: ChainConfig) => void;
  handleTargetChainChange: (value: ChainConfig) => void;
  handleSourceTokenChange: (value: Token) => void;
  handleTargetTokenChange: (value: Token) => void;
  handleSwitch: () => void;
}

export const TransferContext = createContext({} as TransferCtx);

const tokenOptions = getTokenOptions();

export default function TransferProvider({ children }: PropsWithChildren<unknown>) {
  const [token, _setToken] = useState(tokenOptions[0]);
  const [amount, setAmount] = useState({ input: "", value: 0n, valid: true, alert: "" });
  const [sourceChainOptions, setSourceChainOptions] = useState(getSourceChainOptions(token.category));
  const [sourceChain, _setSourceChain] = useState(sourceChainOptions[0]);
  const [sourceToken, _setSourceToken] = useState(getSourceTokenOptions(sourceChain, token.category)[0]);
  const [targetChainOptions, setTargetChainOptions] = useState(getTargetChainOptions(sourceToken));
  const [targetChain, _setTargetChain] = useState(targetChainOptions[0]);
  const [targetToken, _setTargetToken] = useState(getTargetTokenOptions(sourceToken, targetChain)[0]);

  const tokenRef = useRef(token);
  const sourceChainRef = useRef(sourceChain);
  const sourceTokenRef = useRef(sourceToken);
  const targetChainRef = useRef(targetChain);
  const targetTokenRef = useRef(targetToken);

  const setToken = useCallback((value: typeof token) => {
    _setToken(value);
    tokenRef.current = value;
  }, []);
  const setSourceChain = useCallback((value: typeof sourceChain) => {
    _setSourceChain(value);
    sourceChainRef.current = value;
  }, []);
  const setSourceToken = useCallback((value: typeof sourceToken) => {
    _setSourceToken(value);
    sourceTokenRef.current = value;
  }, []);
  const setTargetChain = useCallback((value: typeof targetChain) => {
    _setTargetChain(value);
    targetChainRef.current = value;
  }, []);
  const setTargetToken = useCallback((value: typeof targetToken) => {
    _setTargetToken(value);
    targetTokenRef.current = value;
  }, []);

  const setSelectedSourceChain = useSetAtom(selectedSourceChainAtom);
  useEffect(() => {
    setSelectedSourceChain(sourceChain);
  }, [sourceChain, setSelectedSourceChain]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split("?")[1]);

    const pT = params.get(UrlSearchParamKey.TOKEN_CATEGORY);
    const _token = tokenOptions.find(({ category }) => category === pT) || tokenOptions[0];

    const pSC = params.get(UrlSearchParamKey.SOURCE_CHAIN);
    const _sourceChainOptions = getSourceChainOptions(_token.category);
    const _sourceChain = _sourceChainOptions.find(({ network }) => network === pSC) || _sourceChainOptions[0];

    const pST = params.get(UrlSearchParamKey.SOURCE_TOKEN);
    const _sourceTokenOptions = getSourceTokenOptions(_sourceChain, _token.category);
    const _sourceToken = _sourceTokenOptions.find(({ symbol }) => symbol === pST) || _sourceTokenOptions[0];

    const pTC = params.get(UrlSearchParamKey.TARGET_CHAIN);
    const _targetChainOptions = getTargetChainOptions(_sourceToken);
    const _targetChain = _targetChainOptions.find(({ network }) => network === pTC) || _targetChainOptions[0];

    const pTT = params.get(UrlSearchParamKey.TARGET_CHAIN);
    const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
    const _targetToken = _targetTokenOptions.find(({ symbol }) => symbol === pTT) || _targetTokenOptions[0];

    sourceChainRef.current = _sourceChain;
    sourceTokenRef.current = _sourceToken;
    targetChainRef.current = _targetChain;
    targetTokenRef.current = _targetToken;
    setToken(_token);
  }, [setToken]);

  const [searchParams] = useSearchParams();
  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const navigate = useNavigate();
  const changeUrl = useCallback(
    (onlyTokenCategory = false) => {
      const params = onlyTokenCategory
        ? new URLSearchParams()
        : new URLSearchParams(searchParamsRef.current.toString());
      params.set(UrlSearchParamKey.TOKEN_CATEGORY, tokenRef.current.category);
      if (!onlyTokenCategory) {
        params.set(UrlSearchParamKey.SOURCE_CHAIN, sourceChainRef.current.network);
        params.set(UrlSearchParamKey.SOURCE_TOKEN, sourceTokenRef.current.symbol);
        params.set(UrlSearchParamKey.TARGET_CHAIN, targetChainRef.current.network);
        params.set(UrlSearchParamKey.TARGET_TOKEN, targetTokenRef.current.symbol);
      }
      navigate(`?${params.toString()}`);
    },
    [navigate],
  );

  useEffect(() => {
    const _token = tokenRef.current;

    const _sourceChainOptions = getSourceChainOptions(_token.category);
    const _sourceChain =
      _sourceChainOptions.find(({ id }) => id === sourceChainRef.current.id) ||
      _sourceChainOptions.at(0) ||
      sourceChainRef.current;

    const _sourceTokenOptions = getSourceTokenOptions(_sourceChain, _token.category);
    const _sourceToken =
      _sourceTokenOptions.find(({ symbol }) => symbol === sourceTokenRef.current.symbol) ||
      _sourceTokenOptions.at(0) ||
      sourceTokenRef.current;

    const _targetChainOptions = getTargetChainOptions(_sourceToken);
    const _targetChain =
      _targetChainOptions.find(({ id }) => id === targetChainRef.current.id) ||
      _targetChainOptions.at(0) ||
      targetChainRef.current;

    const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
    const _targetToken =
      _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) ||
      _targetTokenOptions.at(0) ||
      targetTokenRef.current;

    setSourceChainOptions(_sourceChainOptions);
    setTargetChainOptions(_targetChainOptions);
    setSourceChain(_sourceChain);
    setSourceToken(_sourceToken);
    setTargetChain(_targetChain);
    setTargetToken(_targetToken);
    changeUrl();
  }, [changeUrl, setSourceChain, setSourceToken, setTargetChain, setTargetToken]);

  const handleTokenChange = useCallback(
    (_token: typeof token) => {
      setToken(_token);

      const _sourceChainOptions = getSourceChainOptions(_token.category);
      const _sourceChain =
        _sourceChainOptions.find(({ id }) => id === sourceChainRef.current.id) || _sourceChainOptions[0];

      const _sourceTokenOptions = getSourceTokenOptions(_sourceChain, _token.category);
      const _sourceToken =
        _sourceTokenOptions.find(({ symbol }) => symbol === sourceTokenRef.current.symbol) || _sourceTokenOptions[0];

      const _targetChainOptions = getTargetChainOptions(_sourceToken);
      const _targetChain =
        _targetChainOptions.find(({ id }) => id === targetChainRef.current.id) || _targetChainOptions[0];

      const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
      const _targetToken =
        _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

      setSourceChainOptions(_sourceChainOptions);
      setTargetChainOptions(_targetChainOptions);
      setSourceChain(_sourceChain);
      setSourceToken(_sourceToken);
      setTargetChain(_targetChain);
      setTargetToken(_targetToken);
      changeUrl(true);
    },
    [changeUrl, setToken, setSourceChain, setSourceToken, setTargetChain, setTargetToken],
  );

  const handleSourceChainChange = useCallback(
    (_sourceChain: typeof sourceChain) => {
      const _sourceTokenOptions = getSourceTokenOptions(_sourceChain, tokenRef.current.category);
      const _sourceToken =
        _sourceTokenOptions.find(({ symbol }) => symbol === sourceTokenRef.current.symbol) || _sourceTokenOptions[0];

      const _targetChainOptions = getTargetChainOptions(_sourceToken);
      const _targetChain =
        _targetChainOptions.find(({ id }) => id === targetChainRef.current.id) || _targetChainOptions[0];

      const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
      const _targetToken =
        _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

      setTargetChainOptions(_targetChainOptions);
      setSourceChain(_sourceChain);
      setSourceToken(_sourceToken);
      setTargetChain(_targetChain);
      setTargetToken(_targetToken);
      changeUrl();
    },
    [changeUrl, setSourceChain, setSourceToken, setTargetChain, setTargetToken],
  );

  const handleSourceTokenChange = useCallback(
    (_sourceToken: typeof sourceToken) => {
      const _targetChainOptions = getTargetChainOptions(_sourceToken);
      const _targetChain =
        _targetChainOptions.find(({ id }) => id === targetChainRef.current.id) || _targetChainOptions[0];

      const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
      const _targetToken =
        _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

      setTargetChainOptions(_targetChainOptions);
      setSourceToken(_sourceToken);
      setTargetChain(_targetChain);
      setTargetToken(_targetToken);
      changeUrl();
    },
    [changeUrl, setSourceToken, setTargetChain, setTargetToken],
  );

  const handleTargetChainChange = useCallback(
    (_targetChain: typeof targetChain) => {
      const _targetTokenOptions = getTargetTokenOptions(sourceTokenRef.current, _targetChain);
      const _targetToken =
        _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

      setTargetChain(_targetChain);
      setTargetToken(_targetToken);
      changeUrl();
    },
    [changeUrl, setTargetChain, setTargetToken],
  );

  const handleTargetTokenChange = useCallback(
    (_targetToken: typeof targetToken) => {
      setTargetToken(_targetToken);
      changeUrl();
    },
    [changeUrl, setTargetToken],
  );

  const handleSwitch = useCallback(() => {
    const _sourceChain = targetChainRef.current;
    const _sourceTokenOptions = getSourceTokenOptions(_sourceChain, tokenRef.current.category);
    const _sourceToken =
      _sourceTokenOptions.find(({ symbol }) => symbol === sourceTokenRef.current.symbol) || _sourceTokenOptions[0];

    const _targetChainOptions = getTargetChainOptions(_sourceToken);
    const _targetChain = sourceChainRef.current;

    const _targetTokenOptions = getTargetTokenOptions(_sourceToken, _targetChain);
    const _targetToken =
      _targetTokenOptions.find(({ symbol }) => symbol === targetTokenRef.current.symbol) || _targetTokenOptions[0];

    setTargetChainOptions(_targetChainOptions);
    setSourceChain(_sourceChain);
    setSourceToken(_sourceToken);
    setTargetChain(_targetChain);
    setTargetToken(_targetToken);
    changeUrl();
  }, [changeUrl, setSourceChain, setSourceToken, setTargetChain, setTargetToken]);

  const isSwitchAvailable = useCallback(
    (sourceChain: ChainConfig, targetChain: ChainConfig) =>
      targetChain.tokens.some(
        (t) =>
          t.category === tokenRef.current.category &&
          t.cross.some(
            (c) =>
              !c.hidden &&
              c.target.network === sourceChain.network &&
              sourceChain.tokens.some(({ symbol }) => c.target.symbol === symbol),
          ),
      ),
    [],
  );

  return (
    <TransferContext.Provider
      value={{
        amount,
        token,
        sourceChain,
        sourceToken,
        targetChain,
        targetToken,
        sourceChainOptions,
        targetChainOptions,
        setAmount,
        isSwitchAvailable,
        handleTokenChange,
        handleSourceChainChange,
        handleSourceTokenChange,
        handleTargetChainChange,
        handleTargetTokenChange,
        handleSwitch,
      }}
    >
      {children}
    </TransferContext.Provider>
  );
}
