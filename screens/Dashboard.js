import React, { useState, useEffect } from 'react';
import { ScrollView, View, Text, TextInput, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl, Modal, Pressable, Alert, StatusBar } from 'react-native';
import { doc, getDoc, collection, getDocs, addDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/dbConnection';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import Navigation from './Navigation';

const API_KEY = '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';

export default function Dashboard({ navigation, route }) {
    const { id } = route.params;
    const [user, setUser] = useState([]);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const valid = false;
    
    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                
                const userDoc = await getDoc(doc(db, 'students', id));
                setUser(userDoc.data());
                
                const queryOffers = await getDocs(query(collection(db, 'scholarships'), orderBy('dateAdded', 'desc')));
                const offerList = queryOffers.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                setOffers(offerList);
                
                setLoading(false);
            } catch (error) {
                console.error('Error fetching documents: ', error);
            }
        }
        fetch();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#4D4D4D" />
            {!loading ? (
                <ScrollView contentContainerStyle={styles.contentContainer}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>List of Scholarships</Text>
                    <View style={styles.headerIcons}>
                        <FontAwesome5 name="user-graduate" size={24} color="#F7D66A" />
                    </View>
                </View>
                <View style={styles.filterButton}>
                    <TouchableOpacity
                        style={styles.filter}
                        onPress={() => navigation.navigate('FilteredOffersList', {id: id})}
                    >
                        <Text style={styles.filterText}>Filter with AI</Text>
                        <FontAwesome5 name="search-plus" size={30} color="#00FF00" />
                    </TouchableOpacity>
                </View>

                {offers ? (
                    <View style={styles.scholarshipContainer}>
                        {offers.map((offer) => (
                            <View key={offer.id}>
                                <View style={styles.scholarshipItem}>
                                    <View style={styles.scholarshipDetails}>
                                        <Text style={styles.institutionName}>{offer.programName}</Text>
                                        <Text style={styles.postDate}>Posted on {offer.dateAdded.toDate().toLocaleDateString()}</Text>
                                        <Text style={styles.slotRow}>
                                            <Text style={styles.availableSlotsText}>Available Slots:</Text>
                                            <Text style={styles.availableSlotsValue}>{offer.applied}/{offer.slots}</Text>
                                        </Text>
                                    </View>
                                    <View style={styles.externalBadge}>
                                        <Text style={styles.externalText}>{offer.programType}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => {
                                            navigation.navigate('ScholarshipDetails', { id: id, offerId: offer.id, valid: valid })
                                        }}
                                        style={styles.arrowButton}
                                    >
                                        <Ionicons name="chevron-forward" size={24} color="#4D4D4D" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.loading}>
                        <ActivityIndicator
                            size="large"
                            color="#F7D66A"
                        />
                    </View>
                )}

            </ScrollView>
            ) : (
                <View style={styles.loading}>
                        <ActivityIndicator
                            size="large"
                            color="#F7D66A"
                        />
                </View>
            )}

            <Navigation navigation={navigation} id={id}/>

        </View >
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#4D4D4D'
    },
    headerIcons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginVertical: 20,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    contentContainer: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    scholarshipContainer: {
        backgroundColor: '#E6D3A3',
        borderRadius: 15,
        padding: 15,
        elevation: 10,
    },
    scholarshipItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#4D4D4D',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        elevation: 10,
    },
    scholarshipDetails: {
        flex: 1,
    },
    institutionName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    postDate: {
        fontSize: 12,
        color: '#FFFFFF',
        marginBottom: 5,
    },
    slotRow: {
        flexDirection: 'row',
    },
    availableSlotsText: {
        fontSize: 14,
        color: '#FFFFFF',
        marginRight: 5,
    },
    availableSlotsValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#00FF00'
    },
    externalBadge: {
        backgroundColor: '#FFD700',
        borderRadius: 5,
        paddingVertical: 2,
        paddingHorizontal: 8,
        marginRight: 10,
    },
    externalText: {
        color: '#4D4D4D',
        fontSize: 12,
        fontWeight: 'bold',
    },
    arrowButton: {
        backgroundColor: '#FFD700',
        borderRadius: 15,
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // scholarshipContainer: {
    //     backgroundColor: '#F7D66A',
    //     borderRadius: 15,
    //     padding: 10,
    //     paddingTop: 10,
    // },
    // scholarshipItem: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     backgroundColor: '#4D4D4D',
    //     borderRadius: 15,
    //     padding: 15,
    //     marginTop: 10,
    //     marginBottom: 10,
    //     borderColor: '#4D4D4D',
    //     borderWidth: 1,
    // },
    // scholarshipDetails: {
    //     flex: 1
    // },
    // institutionName: {
    //     fontSize: 16,
    //     fontWeight: 'bold',
    //     color: '#FFFFFF'
    // },
    // contact: {
    //     fontSize: 12,
    //     color: '#FFFFFF'
    // },
    // arrowButton: {
    //     backgroundColor: '#FFD700',
    //     borderRadius: 25,
    //     padding: 10,
    //     justifyContent: 'center',
    //     alignItems: 'center'
    // },

    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    //

    filterButton: {
        marginBottom: 20,
        marginHorizontal: 20,
    },
    filter: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        padding: 10,
        borderWidth: 1,
        borderRadius: 50,
        borderColor: '#00FF00'
    },
    filterText: {
        color: '#00FF00',
        fontSize: 16,
        fontStyle: 'italic',
        fontWeight: 'bold',
    }
});