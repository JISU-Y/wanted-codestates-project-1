import React, { memo, useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"
import styled from "styled-components"
import Header from "../components/Header"
import NoList from "../components/NoList"
import RepoCard from "../components/RepoCard"
import Skeleton from "../components/SkeletonRepo"
import { cleanupFeedback, fetchRepos, loadMore } from "../redux/reducers/repoReducer"
import { Container } from "../styles/commonComponent"

const HeaderComponent = () => <Header title="레포 검색" />

const MemoHeader = memo(HeaderComponent)

const RepoCardComponent = ({ repo }) => <RepoCard key={repo.id} repoInfo={repo} />

const MemoRepoCard = memo(RepoCardComponent)

const Main = () => {
  const [target, setTarget] = useState(null)
  const [text, setText] = useState("")
  const dispatch = useDispatch()

  const { data, pageItems, page, maxPage, feedback, loading } = useSelector((state) => state.repoData)

  const handleSubmit = (e) => {
    if (!text) return
    e.preventDefault()
    dispatch(fetchRepos(text))
    setText("")
  }

  useEffect(() => {
    const onIntersect = async ([entry], observer) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target)
        dispatch(loadMore(page + 1))
        observer.observe(entry.target)
      }
    }

    let observer
    if (target) {
      observer = new IntersectionObserver(onIntersect, {
        threshold: 0.4,
      })
      observer.observe(target)
    }
    return () => observer && observer.disconnect()
  }, [dispatch, target, page])

  useEffect(() => {
    dispatch(cleanupFeedback())
    if (!feedback.msg) return
    alert(feedback.msg)
  }, [feedback, dispatch])

  return (
    <Container>
      <MemoHeader />
      <ContentWrapper>
        <SearchForm onSubmit={handleSubmit}>
          <Input placeholder="repo를 검색해주세요." value={text} onChange={(e) => setText(e.target.value)} />
          <SearchButton type="submit">검색</SearchButton>
        </SearchForm>
        {loading ? Array.from([1, 2, 3, 4, 5], (el) => <Skeleton key={el} />) : pageItems?.map((repo) => <MemoRepoCard key={repo.id} repo={repo} />)}
      </ContentWrapper>
      {data?.items.length < 1 && <NoList msg="검색 결과가 없습니다." />}
      {data?.items.length > 0 && page !== maxPage && <TargetDiv ref={setTarget} />}
    </Container>
  )
}

const ContentWrapper = styled.div`
  width: 100%;
  padding: 0 18px 12px;
`

const SearchForm = styled.form`
  width: 100%;
  border-radius: 5px;
  border: 1.5px solid black;
  display: flex;
  overflow: hidden;
`

const Input = styled.input`
  font-size: 14px;
  padding: 8px 12px;
  border: none;
  flex: 1;
  &:focus {
    outline: none;
  }
`

const SearchButton = styled.button`
  font-size: 14px;
  height: 100%;
  padding: 8px 12px;
  border: none;
  background-color: #f6ebff;
  cursor: pointer;
`

const NoResult = styled.div`
  text-align: center;
  font-size: 30px;
  font-weight: bold;
  color: #483d8b;
`

const TargetDiv = styled.div`
  height: 30px;
`

export default Main
