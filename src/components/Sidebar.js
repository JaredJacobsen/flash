import React from 'react';
import useGunState from '../hooks/useGunState';
import ListGroup from 'react-bootstrap/ListGroup'

export default function SidebarWrapper(props){

  const gunQuery = `{
    all {
      [tags] {
        name
      },
      [webTags] {
        domain,
        url
      }
    }
  }`
  const state = useGunState(gunQuery, {})
  
  const tags = (state && state.all && state.all.tags)
    ? Object.values(state.all.tags)
    : []

  const webTags = (state && state.all && state.all.webTags)
    ? Object.values(state.all.webTags)
    : []

  return (
    <div>
      <h1>Flash</h1>
      <br/>
      <h2>Tags</h2>
      <hr/>
      <ListGroup>
        {tags.map((tag, index) => (
          <ListGroup.Item key={index} active={props.selectedTags[tag.name]} action onClick={() => {
            props.setSelectedTags(Object.assign({...props.selectedTags}, {[tag.name]: !props.selectedTags[tag.name]})) 
          }}>
            {tag.name}
          </ListGroup.Item>
        ))}
      </ListGroup>
      <br/>
      <h2>Websites</h2>
      <hr/>
      <ListGroup>
        {webTags.map((webTag, index) => (
          <ListGroup.Item key={index} active={props.selectedTags[webTag.url]} action onClick={() => {
            props.setSelectedTags(Object.assign({...props.selectedTags}, {[webTag.url]: !props.selectedTags[webTag.url]})) 
          }}>
            {webTag.url}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  )
}