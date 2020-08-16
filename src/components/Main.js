import React from 'react';
import useGunState from '../hooks/useGunState';
import ListGroup from 'react-bootstrap/ListGroup'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import useGun from '../hooks/useGun';
import sortBy from 'lodash/sortBy'
import uuid from '../utils/uuid-v4'

export default function Main(props){

  const gunQuery = `{
    all {
      [cards] {
        frontText,
        backText,
        due,
        [tags] {
          name
        },
        [webTags] {
          url
        }
      }
    }
  }`
  const state = useGunState(gunQuery, {})
  const gun = useGun()

  const filterTags = Object.entries(props.selectedTags).filter(([k, v]) => v).map(([k, v]) => k)

  console.log(state, props.selectedTags)
  
  const cards = (state && state.all && state.all.cards)
    ? sortBy(
        Object.entries(state.all.cards).filter(([id, card]) => {
          if (!card.due) {
            return false
          }
          if (filterTags.length > 0) {
            if (!card.tags || !card.webTags) {
              return false
            }
            const allTags = Object.values(card.tags)
              .map((t) => t.name)
              .concat(
                Object.values(card.webTags)
                  .map((t) => t.url)
              )
            return filterTags.every(t => allTags.includes(t))
          }
          
          return true
        }),
        [function(o) { return o[1].due}]
      )
    : []

  // const [openCards, setOpenCards] = React.useState({})

  function addDays(time, numDays) {
    return time + numDays * 86400000
  }

  function delayDueDate(delayTime, due, cardId) {
    return () => {
      gun.get(cardId).put({due: addDays(due, delayTime)})
    }
  }

  function createNewCard(frontText, backText, cardId=`card::${uuid}`) {
    const newCard = gun.get(cardId).put({frontText, backText, due: Date.now()})
    gun.get('all').get('cards').set(newCard)
  }

  const [formValues, setFormValues] = React.useState({})

  return (
    <div>
      <h2>Cards</h2>
      <hr/>
      <Form onSubmit={(e) => {
        e.preventDefault()
        createNewCard(formValues.frontText, formValues.backText)
      }}>
        <Form.Group controlId="formFront">
          <Form.Label>Front</Form.Label>
          <Form.Control type="text" value={formValues.frontText} onChange={(e) => {setFormValues({...formValues, frontText: e.target.value})}}/>
        </Form.Group>
        <Form.Group controlId="formBack">
          <Form.Label>Back</Form.Label>
          <Form.Control type="text" value={formValues.backText} onChange={(e) => {setFormValues({...formValues, backText: e.target.value})}}/>
        </Form.Group>
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
      <hr/>
      <ListGroup>
        {cards.map(([id, card], index) => (
          
          <ListGroup.Item key={index} style={card.due < Date.now() ? {borderColor: 'red', borderWidth: 2} : {}}>
            <p>{`Front: ${card.frontText}`}</p>
            <p>{`Back: ${card.backText}`}</p>
            <p>{`Tags: ${card.tags && Object.values(card.tags).map((t) => t.name)}`}</p>
            <p>{`Web Tags: ${card.webTags && Object.values(card.webTags).map((t) => t.url)}`}</p>
            <ListGroup horizontal>
              <ListGroup.Item action onClick={delayDueDate(1, card.due, id)}>1d</ListGroup.Item>
              <ListGroup.Item action onClick={delayDueDate(5, card.due, id)}>5d</ListGroup.Item>
              <ListGroup.Item action onClick={delayDueDate(10, card.due, id)}>10d</ListGroup.Item>
              <ListGroup.Item action onClick={delayDueDate(100, card.due, id)}>100d</ListGroup.Item>
            </ListGroup>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  )
}