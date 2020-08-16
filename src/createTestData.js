

async function createTestData(gun) {

  // Create tags
  
  const tags = gun
  .get('set::tags')
  // .put({
  //   type: 'set'
  // })

  const tag1 = gun
    .get('tag::tag1')
    .put({
      type: 'tag',
      name: 'tech'
    })

  const tag2 = gun
    .get('tag::tag2')
    .put({
      type: 'tag',
      name: 'Kanye West'
    })

  const tag3 = gun
    .get('tag::tag3')
    .put({
      type: 'tag',
      name: 'Bitcoin'
    })

  tags.set(tag1)
  tags.set(tag2)
  tags.set(tag3)

  // Create web tags

  const webTags = gun
  .get('set::webTags')
  // .put({
  //   type: 'set'
  // })

  const wt1 = gun
    .get('webTag::wt1')
    .put({
      type: 'webTag',
      domain: 'google.com',
      url: 'google.com/test'
    })

  const wt2 = gun
    .get('webTag::wt2')
    .put({
      type: 'webTag',
      domain: 'wikipedia.com',
      url: 'wikipedia.com/test'
    })

    const wt3 = gun
    .get('webTag::wt3')
    .put({
      type: 'webTag',
      domain: 'twitter.com',
      url: 'twitter.com/test'
    })

  webTags.set(wt1)
  webTags.set(wt2)
  webTags.set(wt3)


  // Create cards

  const cards = gun
    .get('set::cards')
    // .put({
    //   type: 'set',
    // })

  const c1 = gun
    .get('card::c1')
    .put({
      type: 'card',
      frontText: 'What is the most important advice Peter Thiel would give to young people?',
      backText: 'Competition is for losers',
      due: 1597552354538
    })

  c1.get('tags').set(tag1)
  c1.get('webTags').set(wt1)

  const c2 = gun
    .get('card::c2')
    .put({
      type: 'card',
      frontText: 'How much Bitcoin does Kanye West have?',
      backText: '100 Bitcoin',
      due: 1597812957903
    })

  c2.get('tags').set(tag2)
  c2.get('webTags').set(wt2)

  cards.set(c1)
  cards.set(c2)


  //Put everything together

  const all = gun.get('all')
    // .put({type: 'root'})
  all.get('tags').put(tags)
  all.get('webTags').put(webTags)
  all.get('cards').put(cards)
}

export default createTestData