import React, { useState, useEffect, useRef } from "react";
import { Config, PixelStreaming } from "@epicgames-ps/lib-pixelstreamingfrontend-ue5.4";
import "./Customize.css"; 

<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" />
const Customize = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    // 5개의 슬라이더 상태 관리
    const [sliderValues, setSliderValues] = useState([0, 0, 0, 0, 0, 0]);
const lastSentRef = useRef([false, false, false, false, false, false]);    

const prevSliderRef = useRef(null);

const sliderImage = [
    "data:image/png;base64,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",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALAAAACwCAYAAACvt+ReAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAABP1JREFUeAHt3YFx2zYUAFC4E2SDaoO6E8Qb1BvEnSDZIN4g3cDZIN3A7gRJJqA7gbPBL1HSieMTQFBRZJN6746nO0qiFfATBPEBJCUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABYtIt7Gdu/SkevLYFMom7u0Mr+k9fmSjtzJyclt4a0XaWWWHMCbwv7bRLb1Qu5r4V/TiqyxBmZwFHeiJQdw6XZ49E2IY7LIAO5vg6f9y3nhbQFcd5lWZHEBnJ+w+5cPiV1d9GX4JvE0+sK/irrfErmcPk6U02nisPpCP6uckLt+e5n4X18WL/rtQ6W8rhOHlQu9ckLOE98Zg7hWE58lDiPK2aXsbWKrsdzuCuV29FnLg+kL+3XhJHSJqiin3VeXWn62otx8uEpUxdCUKFn0w9ySutFKBf0+UXVycpL7xm8Kby+612ZJAbw189afnH8SLT4V9m/Sgi0igGNIXmwj69ZulWVlMA+LtogAro1vzQ8oiRarLKcl1cC3hf1Som1K5fQpLdiSArhU0MY+tDkr7P83LdiSAvimsF8KeUKUU8a3ffNMDXwgnwv7T7WDJ70q7F908C5OJaf/OlGU0+2FcnuVOJwojwU2NLCgL5uLKNskDifq44HNMngkhjEQnYv+GYny+NY7Ncr3+vL4q3LBaz48hYlbYieIB305XNbKKfF0oj4zo8u1SwwDufN2FD0UD/69uZlVm0qk9n1q/Qk4jXZ3aw/iqN+VHjN++jnoT8SbGSdttVOOYqh1u8Zy6NZ+MS9KlKfKPLbaWjjqbd3HwbtJPC8zgnjnCYz9d8/Hv7PXtmMM8/zycXdKh0d9outDHwXvMxbDg0vXcCLP0kz9d97v60J4cMxt090v00wx/bCW7zxvQ7NhGfoT9UfUV+7p5pzMKCdOLtOOYqg1S33Zc35b7cHto8BdsP7Evauc3OYadCJILtNMMX2naFpZKOprPWSbxHLFcIuuneCzPR3nqiVYxuPUsmJZc3Ih6heBRV7WIIYHr5LmtHO09bFexaOLYgzaXOO+i/pFcP97mmaWhAzb8Yj6Q04XjW3EaO/puD9uN/Pzm8bfMdX33XQcFiLqo7Gy5hFZMS+IW11He/CeTxxL02GNoj4EM2tOrcbQnOhiP5oDLobUebUtnlivmL71Xs44Vu4BuIrdXceM9cgagrcL3WXrF/WutWxWLfYgkKce0GL8TP7srAW4G4N3k47YSToiMbR5zyof+bvf/hwXw5tz3JfjcTfj9mXcPo3b5x2OedG/5D7rWu36+9JnFTNDTK9Y/ixqtWgboGNM7zGaEcRn6cDG3/Y+pgneY9YYxNllOpAY2rtdw28SvHwN4uuGgOniJzYpxt/R0mTID3NWIeJ7Md07cS8H2V67q6J9GGj+jEUM2S7as2w5kH74Fh5DF9x14980GJ1pM2rDnQM5hnbuVbTLdwdJCtrE/CxbF+MU/onj5ovjuv2w2rutjiqR0SqGJEIeq7CZ8bWcBLlJ31bR3KRh7eKLNG919Js0JFNuE+wqfnzMw1ydWpe9i/b+2V2ZeMnPF/sdSilweRpjIF/H7gQuTy++dYm1DKeMMehfC9z90guxB/FtOGXOlt0HaB4+eZuG4ZQ3fa/Cov83IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEjpP+SQSiVaZX86AAAAAElFTkSuQmCC",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALAAAACwCAYAAACvt+ReAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAABRBJREFUeAHt3YF1m3YQx/FTF2g2KBukG5RO0G6QbBBvYG/gbiBvkBGkTFBnAqkT2J3g1z8BGj1HHCBAguP7eY/nGBsET39d/txx2AwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAVxvD6CTl6cv7tGTVqmNavm42m70Bc5UG7se0HNSs+NkHA+YkDcp3aXlSd4/FNgbMQRqMf6u/nQG3lgbigy53b8CtpAGYaZgXMZUY5CfDEF4EfU7LXVoerMxCnFMM3kcDrq0l+n4+8/s75/dzA66pZUBmZ37fG/Bc0OF6VOZ7m2yd7R5FFMatqblYcTgXfU+2K/LFLyIK41Zaou+nDtvfO9tTpcO05ETfjtu/a4ngpNUwDflFi87RU34Up7iB8anMIrwMib5v9rdr2BfFDYwvDaptc9DUb9ZT2iYXURjXID+Hux2w352z38yAMbRE38wu1BKFSathuJZBdnH0Pdn/1tl/bsAQ8jssMhtI/sUhURiX05XSXfKLG7kBl9CVCg7yS8y9U3RAW/QdveSb9nnnvN6dAV2pnJcerh0RndekuIHu0mD5S1eMvievS3EDw+jGN57LLzFnBng0UdGix+tPmndGYJqoZHzBceyc48gNOEczuTdB9M+hL/lps6u3vov+OfShC/vcJjwe+ufQjQb2uU14XPfOcdE/h5JuULToeFz0z8GnkfrcJjw++udwnkbuc5uK6J/DORq5z20q8osbPBxwjTSTokVXon8Op3TjknFfon8ONS30fgPRP4eC/PtuM5sp0T8HLTwtJfrn1k0LLwyI/rn10pX73KYi+ufWRzfqc5uK6J9bF92oz20qon9uPRT0BnHRP7cOWljRoivRPxefFlYy7kv0z8UWNfrWRP9cXC1vbpi7uOT3z5GRWKr05n1qeFMPEaJvTX5xI3RGIvof+/6zYf1+s9kcLYh0Lq/py1PDj3PD8lRRqcmvFoz8jATTiKVx3tCw9ws404hwH9ha5ClE1rD+2eLaN6x/b0FFHsC/NKw/WlzHhvVhpxDRL+LOebW4ms6NAQzMUeQB3BSNMour6WLtaEFFHsD/NKwPe0VuzR/Oo2FZ5JeRw80JW/LemQUVNgJXlbamacQfFk9T1fEYqeq4Kmq+Ey3cXVpqbjHivuClkl9ezS0I+c2qs3nGGy4gpwVdAebCCtasijfkPwjksy1ccQ7O+fEU96WT/5TzwmLniOnYn5zzIvpGIX8u/C0Sa0GppupDuWs5J+a+kchvu/kWsbSA/3JVXrC9tJwLz4WIqEPU+n8ga0YRWeWF2oP8qVBtVY2cG1sRlVmH4g3uWk4uCiHP1dfXk++/jF0cqI6tKEYU9+7W2ZHMymPtmi0pju33qsUIEanb/LGL7RhRWuX8fKvhdqJ1aD3kp9f6DpwP6tG2o3JK8EnjfJAKq/1DL6uaQrxVDboiF5zZOOopRj3tOJVZ/ylBm31aHtKU4YthvVRe2R+0HLu0RLwhqbdVR+C3VEbkIpWW2/zuG97XCxH3OwawoxrQP9v3KUaelo82nfoBJc8n3xf//pfMAkah8gLsXuNOOQ7VPski9EQEHkBlubbI3RaROu+xaR1Z98aUYBAG8IiqKUfxPIrMfsw01IWQr2nARn64CgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAICZ+g8+byJbKHhkPQAAAABJRU5ErkJggg==",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALAAAACwCAYAAACvt+ReAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAABLJJREFUeAHt3YGRm0YYBtBVGog6iDrwdXDqIO4g7uDcgdSB04GSClwCdgV2KsCp4JwK/kBAY41GwOqCENK9N7Mjzx2L4fi0WpYFpQQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA92+RGF1ELKuX5dGPvy8Wi++JUQnwC1Uhfahe6vKmKqv236eCe6wO8bf29Wtb/q7C/SlxNgHOVAV2Xb3U5TH9COvYPrXls0DnEeAebWh/rcq7dJnA9vmWmjD/Kcxkq/uvVdlW5Tnmo6zKriqrBKdU4VhXpYj524UgsxeXC27dgpdtuURrvgtBfr3qg1+VjzGeoipPVXmMZhjt+P9btr97inHfMLsQ5Nclxu3jfqjKmzM3Yf8G2sV4ton7Fk13oYxxFDFCyxdNkIsYRxla4/tUHdjfYzxPaWTVOjcxnm3iPsR5LdxzDHctfksXUq37Xcb2lZHnS2iNb1s0XYacvm69zKYqDwPLXSy8B9v8bmA76336EHnKaC7GcGuqA/c+8yAX0bZU0X9StUkTif7uxK5d5pyTwG3idkQzyjCkbs3eHtRZ9SxbpIlFf7dnebBc3WKXIcT3oTpQf2QczCKO+ofR35qt0sSi/w21ObFszpj2h8R8ZYb3qaNu2bH8Ll1JdL+pnjuW38Swq+0PPTLCW3cZHjvqrnvqrdKVRP9J5bqjTs5YtxDPSUZ4y74gRnN595TJ+74ntq3o2LannjqrEOLbEMMnbPV46HJgHcW5IZlKdL+5Pg7UW7X73kef+JrGCG+7nq4D/ZiuLLq7N2VG3WVGiLeJ6cXwOG9WeNt1dZn6LoxT27bs2rgz6g+F+OIXaDgQzcfj80jh7Rquek4z0bOvv2TWHwpxvf6HxOXF8AlKGWe0nNEd4MGP6Kn07G9WgNt1LDP+bqt0Y35Kt8ezFbht0YyP6kLk72NOF2KVmE4MTz10EpeyT+LeJqYXw5dOc4fRyo7663Rl0T2M9iWjbk54J5tlxwkxPDd2cGJ3dE+EufcLGcI7B+FS8nEdl5JvTWaI1x111z31rjY+Gv1TKh866uTchSK8cxR50ym3HXW7DvrV5gtE93TKsmP5nLtQhHfOIu9+sbrPuzqqt+lZfpUmFudPaC9CeO9D5E3sLuNgDkD0DFfF/G4pWh0s9zbyblx1wnZLIv+mzl3k3dT5Pk0k+mfZHd7UWUSeq4+m8ALRXLErMw9y3fUYOgGaw2319T5tI6/VLWMGU0L5HyJvPPTwgM/9wSa5z3QrwuXh+xEzf3RT5D0KIJf+7j2KvAH+XEXM8+F+ugz3LsZtjXfxgiBH05fdxTj+ezRW4vWI8Z/PW0RzSbo+Eex6wHX9u214wDVjifGDvHfprxgoQneBvbhckMdWhODSJZogb2K8k70x7B//evUJ9tyQaL6UZRfXCXMd2vriita2h2/qzNQGaX1Qxrb/7uRPdVksFp8TgwT4haKZj1vf1r5OzZd978vQx/y39OMLv+tSh/avKrBfE2cT4Ato+6o/H/34nyqkHgkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJztX5QavYRjYhKNAAAAAElFTkSuQmCC",
    "data:image/png;base64,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",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALAAAACwCAYAAACvt+ReAAAACXBIWXMAACxLAAAsSwGlPZapAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAOdEVYdFNvZnR3YXJlAEZpZ21hnrGWYwAABV1JREFUeAHt3YtV3EYUxvFLKnAHUSqwU0E2FdipwOnAdAAdkA5wB7iDpQPSweAK1qngi+bMEAhoXmIlJO3/d84eztmHtIyurualWTMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPCcpIOGvTP8T18mu0RZ3Rnm1xf8ZeKAyPBCXyyd0s4N8+kL/M/MwSCABxQC2PtgmF48EC5zILgkDujL5V2h3Jxhen1BX+eCV9R/kypOfqoSU1L+Muj864asWIapxu/BMB3l676doUpfVp8y5bgzTEOhijDk2tCkL7M9ZTkjhUZICi3oRpmrGdWIKSjdEU/reYSYEFJ14Z9twX6ydXqfeP5vQ7Ozs7Mf/Z/7xMuLvqKtNYBT3WME8Hipslt0V+RaA7hLPP/DcFLWGsD3iecZuDgxaw3gFAJ4vC7x/KKvamsN4O+J5+lCGy9Vdt8Nx6X8MDJZuJHvO08Vpi3cKjNw3+1zb+lL26gs3B+rc4XRvX3/+GSNYl/qVdzGtSqHs+Mgwj4+PtsICvOhH777ztqlyuzWMI3+QN0kksaFNdLwhPhdw+eHZna50tVAwyNgl1YpnjRfB7bRdBIrPavvyjCNvnC/JAp9b400PK3wUBMICqOCLvFdPhc+u098rjiVUeGkuTtG4GW+/0fDNJSpt6nxMqr8vFifnbuBz/js95fyPhb2e5P57HVmv/47HTKfrQ5g5Wf1Lb49cWYrpjD3oRt46bavJ/9ulRQyXumgf7MwWuUPqs/Mu8L77/vv8Ivl97vr/5SuGLf2OEr2IT5ygeXbBr/GdkJRpgy/9dv4wzCdvvAvMtlj17itrzoep/pG3IWOp6ra82Tfuew7qkGJBsrPonJquATGbd3o9Xy9tLMGOk4Qu5b9Kn9LEbP65lI4+M0TsvW6YBrdalfoxjuM3K8/8VpPVpfZHtl3LspnYW9MRvTZaa96/r2vHgWM+71u3O9vjfvI9Zp4ZN+5KX9f138HJj6qb7X3wRED6nl31SEGz4UmmPCtEMhXcR+HZ/u9i69VBa4eu9uc8oH7oDPMLx7UWmNHvN6sW2nsvtWW0ZsHgXBEqr/sO53AnAmVV+AheJdEbT0Jmz9gqs++BO+SqK4nwdcnN5uFVZd9fRk0T1zCDPTYor/LHMDNrnugfINtr3CSM/V0DZSvG+9sYxT6lE/upN0s5Sf+uC1lIuXXO/P/a2dYH+W72TaTlcQI2zapPHx6biunzEr1YoRt/ZRekurBam8KVb7e63WG9VO+KuHWeKCVr/d6XwzboFCVuCsE8WoadSqvtE6vw9ZUZKxV/DxBRfD61zrD9qg8g23RQVwRvAeCd+NUHnJeZBBXBK/HEPEpUHkaZvOE+ClVBi+Tc06Jyjd0uiUEsUI3YOm2I4L3FFUE8ZvO3FK5n5fgPXWqu7X+0mak9PJRBC9eUt2tSU4zVClUvgGT4MVLqr+1/tImoLplqx4wyoaXVFfn9JyOOMtLYbWcmvUh/HuabqnHiVGYR+xUx9+L19lICtWFfeW+FtW1hwVT+2Ij/r27hu23BK7n6+jcCoQ2al/6yWfJz0PBpsclUl395qgy4JXUno2fBvM+PpzakXVxPAoNLafp+cAn62IaCt1tTsfnqwt0j2F6CtWKiyMF8kGs14C3EAN5bNVir0SDD5idHpdldZmg9a9VL5OKYav+kZc1iFn1/ZOn/rHwAzCL/g1iAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4KV/AaAV7je1pWQUAAAAAElFTkSuQmCC"
]

const sliderLabels = [
        "얼굴 | Head scale", 
        "턱 | Jaw scale", 
        "코 | Nose scale", 
        "눈 | Eye scale", 
        "입술 | Mouth scale",
        "광대 | Cheek scale",
    ];

    const sliderNames= [
        "head",
        "jaw",
        "nose",
        "eye",
        "mouth",
        "cheek",
    ]

    const videoWrapperRef = useRef(null);
    const psInstanceRef = useRef(null);

    const resetSliders = () => {
        const resetValues = [0, 0, 0, 0, 0, 0];
        setSliderValues(resetValues);

        lastSentRef.current = [false, false, false, false, false, false];

        if (psInstanceRef.current) {
            sliderNames.forEach((name) => {
                psInstanceRef.current.emitUIInteraction({
                    Category: "Customize",
                    Type: name,
                    Value: "0"
                });
            });
        }
    };

    const disconnectStreaming = () => {
        if (psInstanceRef.current) {
            psInstanceRef.current.disconnect();
            psInstanceRef.current = null;
        }
        if (videoWrapperRef.current) {
            videoWrapperRef.current.innerHTML = "";
        }
        resetSliders();
        setIsLoading(false);
    };

    const openWidget = () => {
        setIsLoading(true);
        setIsOpen(true);
    };

    const closeWidget = () => {
        disconnectStreaming();
        setIsOpen(false);
    };

    useEffect(() => {
        if (isOpen && !psInstanceRef.current && videoWrapperRef.current) {
            const connect = async () => {
                try {
                    const matchmakerUrl = import.meta.env.VITE_MATCHMAKER.replace("https://", "http://");
                    const res = await fetch(`${matchmakerUrl}/signallingserver`);
                    const data = await res.json();

                    const config = new Config({
                                                            initialSettings: {
                                                                ss: `wss://${data.signallingServer}`,
                                                                AutoPlayVideo: true,
                                                                AutoConnect: true,
                                                                //StartVideoMuted: true,
                                                                HoveringMouse: true,
                                                            },
                                                        });
                    
                                        const psInstance = new PixelStreaming(config);
                                        psInstanceRef.current = psInstance;

                    psInstance.addEventListener("videoInitialized", () => {
                        if (videoWrapperRef.current) {
                            videoWrapperRef.current.innerHTML = "";
                            videoWrapperRef.current.appendChild(psInstance.videoElementParent);
                            setIsLoading(false);
                        }

                        psInstance.emitUIInteraction({
                            Category: "Page",
                            Type: "CustomizePage"
                        });
                    });

                } catch (err) {
                    console.error("Matchmaker connection failed:", err);
                    setIsLoading(false);
                }
            };

            connect();

            return () => {
                disconnectStreaming();
            };
        }
    }, [isOpen]);

    const handleSliderChange = (index, event) => {
        const newValue = parseFloat(event.target.value);
        
        // 화면의 슬라이더 UI 업데이트
        const newValues = [...sliderValues];
        newValues[index] = newValue;
        setSliderValues(newValues);

        // 언리얼 엔진으로 데이터 전송 (기존 Tag 형식 유지!)
        if (psInstanceRef.current) {
            psInstanceRef.current.emitUIInteraction({
                Category: "Customize",
                Type : sliderNames[index],
                Value: String(newValue)         // 숫자를 문자열로 변환해서 Value 키값에 담아 전송
            });
        }
    };
    const getSliderStyle = (value) => {
        const percent = ((value + 1) / 2) * 100;

        return {
            background: `linear-gradient(to right,
                #BFD8F6 0%,
                #426AE8CC ${percent}%,
                #ffffff ${percent}%,
                #ffffff 100%)`
        };
    };

    const handleSliderStart = (index) => {
    if (!psInstanceRef.current) {
        console.warn("psInstanceRef 아직 준비 안됨, 이벤트 대기");
        return;
    }

    if (prevSliderRef.current !== index) {
        console.log(`✨ 최초 클릭 이벤트: ${sliderNames[index]}`);

        setTimeout(() => {
            psInstanceRef.current.emitUIInteraction({
                Category: "CustomizeInit",
                Type: sliderNames[index],
            });
        }, 5);

        prevSliderRef.current = index;
    }
};
    return (
        <>
        <div id="cust-app-root">
            <div className={`cust-widget ${isOpen ? "open" : "closed"}`}>
             
                {isLoading && (
                    <div className="cust-loading-overlay">
                        <div className="cust-loading-spinner" />
                        <span>Connecting...</span>
                    </div>
                )}

                <div ref={videoWrapperRef} id="cust-video-wrapper" className="cust-video-wrapper" />

                {/* 우측 슬라이더 5개 패널 */}
                {!isLoading && (
                    <div className="cust-panel-wrapper">
                        <div className="cust-panel">
                            <div className="cust-slider-panel">
                            {sliderValues.map((value, index) => (
                                <div key={index} className="cust-slider-item">
                                    <div className="cust-slider-header">
                                        {/* ★ [수정] 파라미터 1 대신 배열에 적힌 진짜 이름 출력 */}
                                        <label>{sliderLabels[index]}</label>
                                    </div>
                                    <div className="cust-slider">
                                        <div className="slider-icon-small">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                                                {/* href 속성에 따옴표 없이 중괄호만 사용합니다 */}
                                                <image width="24" height="24" href={sliderImage[index]}></image>
                                            </svg>
                                        </div>
                                        <input
                                            type="range"
                                            min="-1"
                                            max="1"
                                            step="0.01"
                                            value={value}
                                            onMouseDown={() => handleSliderStart(index)}
                                            onTouchStart={() => handleSliderStart(index)}
                                            onChange={(e) => handleSliderChange(index, e)}
                                            className="cust-range-input"
                                            style={getSliderStyle(value)}
                                        />
                                        <div className="slider-icon-big">
                                             <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44">
                                                {/* href 속성에 따옴표 없이 중괄호만 사용합니다 */}
                                                <image width="44" height="44" href={sliderImage[index]}></image>
                                            </svg>
                                        </div>
                                    </div>
                                    
                                </div>
                            ))}
                            </div>
                            <div className="cust-bottom">
                                <button className="cust-btn-cancel"  onClick={closeWidget}>취소</button>
                                <button className="cust-btn-apply">적용</button>
                            </div>
                        </div>
                    
                        <div className="cust-side-toggle">
                            <button className="cust-side-btn appearance">
                                {/* <img src={`${import.meta.env.BASE_URL}imgSrc/btn_Appearance.png`} alt="appearance" /> */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><image width="24" height="24" href="data:image/png;base64,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"></image></svg>
                            </button>

                            <button className="cust-side-btn customize active">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><image width="24" height="24" href="data:image/png;base64,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"></image></svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 열기 버튼 (기존 유지) */}
            {!isOpen && (
                <button type="button" className="cust-toggle" onClick={openWidget} aria-label="전체화면 열기">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="white" className="cust-fullscreen-icon">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                    </svg>
                </button>
            )}


            </div>
        </>
        
    );
};

export default Customize;