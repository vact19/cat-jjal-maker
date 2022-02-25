import logo from './logo.svg';
import React from "react";
import './App.css';
import Title from "./components/Title" // js 파일확장자 생략

const jsonLocalStorage = {
  setItem: (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getItem: (key) => {
    return JSON.parse(localStorage.getItem(key));
  },
};
const fetchCat = async (text) => {
  const OPEN_API_DOMAIN = "https://cataas.com";
  const response = await fetch(`${OPEN_API_DOMAIN}/cat/says/${text}?json=true`);
  const responseJson = await response.json();
  return `${OPEN_API_DOMAIN}/${responseJson.url}`;
};

function CatItem(props) { // 컴포넌트는 첫글자 대문자
  return (
    //넘긴 인자는 props라 부름. HTML 안에서 리액트 문법 쓸 땐 중괄호
    <li>
      <img src={props.img} style={{ width: "150px" }} />
    </li>
  );
}
// 리액트에서는 컴포넌트를 함수로 구현.
// 인자를 넣을 수 있어서, 인자를 바꿔가며 반복 활용
function Favorites({ favorites }) {
  if (favorites.length === 0) {// 사진이 없으면 아래 메시지 출력 (조건부 렌더링)
    return <div>사진 위 하트를 눌러 고양이 사진을 저장해봐요!</div>
  }

  return (
    // HTML 태그 쓰듯이 함수 사용. key값이 있어야 하는데 지금은 쓸 게 없으니 배열값을 그대로 넣음
    <ul className="favorites">
      {favorites.map(cat => <CatItem img={cat} key={cat} />)}
    </ul>
  );
}

// 이것도 컴포넌트지만, 함수를 arrow function 방식으로 구현함
const MainCard = ({ img, onHeartClick, alreadyFavorite }) => {
  const heartIcon = alreadyFavorite ? "💖" : "🤍";

  return (
    <div className="main-card">
      <img
        src={img}
        alt="고양이"
        width="400"
      />
      <button onClick={onHeartClick}
      >{heartIcon}</button>
    </div>
  );
}

const Title = (props) => {
  return (
    <h1>{props.children}</h1>
  );
}

//컴포넌트는 함수로 구현!
//return문 생략
const Form = ({ updateMainCat }) => {
  const [value, setValue] = React.useState(''); //[초기상태, setter]
  const includesHangul = (text) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/i.test(text); // 한글 검사 함수
  const [errorMessage, setErrorMessage] = React.useState('');
  function handleInputChange(e) {
    const userValue = e.target.value;
    setErrorMessage(""); // if else하기보다 미리 빈칸을 set해둠
    if (includesHangul(userValue)) {
      setErrorMessage("한글은 입력할 수 없습니다.")
    }
    setValue(userValue.toUpperCase());
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    setErrorMessage();
    if (value === '') {
      setErrorMessage("빈 값으로 만들 수 없습니다.")
      return;
    }
    updateMainCat(value);
  }

  return (
    <form onSubmit={handleFormSubmit}>
      <input type="text" name="name" placeholder="영어 대사를 입력해주세요"
        value={value}
        onChange={handleInputChange}
      />
      <button type="submit">생성</button>
      <p style={{ color: "red" }} >{errorMessage}</p>
    </form>
  );
};


const App = () => {
  const CAT1 = "https://cataas.com/cat/60b73094e04e18001194a309/says/react";
  const CAT2 = "https://cataas.com//cat/5e9970351b7a400011744233/says/inflearn";
  const CAT3 = "https://cataas.com/cat/595f280b557291a9750ebf65/says/JavaScript";
  // Form 컴포넌트 안에 있던 아래 카운터 코드를, App 컴포넌트에 소속시켜서 
  //                    APP 컴포넌트의 자식 컴포넌트들이 공유할 수 있게 함

  // 0번째 인덱스에는 카운터 자체가 // 1번째에는 카운터 설정 함수가 있음
  // localStorage에서 값을 String으로 읽어오므로, 숫자 변환

  const [counter, setCounter] = React.useState(() => {
    return jsonLocalStorage.getItem('counter')
  })

  const [mainCat, setMainCat] = React.useState(CAT1)
  const [favorites, setFavorites] = React.useState(
    jsonLocalStorage.getItem("favorites") || [] // 앞이 null이면 빈 배열을 넣는 문법
  );


  const alreadyFavorite = favorites.includes(mainCat); // 자바스크립트 배열 api includes

  async function setInitialCat() {
    const newCat = await fetchCat('First cat'); // async await 문법
    setMainCat(newCat);
  }

  React.useEffect(() => {
    setInitialCat();
  }, []);




  async function updateMainCat(value) { //handle... 은 리액트 함수명 관례 
    //event.preventDefault(); // form 전송 시 refresh되는 것을 막음
    const newCat = await fetchCat(value);

    setMainCat(newCat);

    setCounter((prev) => {
      const nextCounter = prev + 1;
      jsonLocalStorage.setItem("counter", nextCounter);
      return nextCounter;
    });
  }
  function handleHeartClick() {
    console.log("하트클릭");
    const nextFavorites = [...favorites, mainCat]
    setFavorites(nextFavorites); // CAT1, CAT2, CAT3와 같음. 나열하는 문법
    jsonLocalStorage.setItem('favorites', nextFavorites);
  }
  const counterTitle = counter === null ? "" : counter + "번째 ";

  return (
    //Title처럼 직접 입력하면. props.children으로 읽어올 수 있음.
    // 관례상 prop으로 넘기는 함수는 on~을 붙힘
    <div>
      <Title>{counterTitle} 고양이 가라사대</Title>
      <Form updateMainCat={updateMainCat} />
      <MainCard img={mainCat} onHeartClick={handleHeartClick} alreadyFavorite={alreadyFavorite} />
      <Favorites favorites={favorites} />
    </div>
  );
};


export default App;
